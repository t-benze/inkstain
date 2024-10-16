# Divert the program flow in worker sub-process as soon as possible,
# before importing heavy-weight modules.
if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
import base64
from io import BytesIO
import sys
import os
import json
from PIL import Image
import psutil
import torch
from surya.model.detection.model import load_model as load_det_model, load_processor as load_det_processor
from surya.model.recognition.model import load_model as load_rec_model
from surya.model.recognition.processor import load_processor as load_rec_processor
from surya.layout import batch_layout_detection
from surya.settings import settings
from surya.ocr import run_recognition
from surya.ocr import batch_text_detection
from surya.postprocessing.heatmap import draw_polys_on_image
import copy

ram = psutil.virtual_memory().total / 1024**3  # Convert to GB
if torch.cuda.is_available():
    ram = torch.cuda.get_device_properties(0).total_memory / 1024**3  # Convert to GB
settings.RECOGNITION_BATCH_SIZE = int(4 * (ram / 8))
print(f"Using batch size: {settings.RECOGNITION_BATCH_SIZE}")

def load_image(image_path):
    # Read the base64 string from the input file
    with open(image_path, 'r') as f:
        base64_string = f.read().strip()
    # Decode the base64 string to bytes
    image_bytes = base64.b64decode(base64_string)
    # Create a PIL Image from the bytes
    image = Image.open(BytesIO(image_bytes))
    # Ensure the image is in PNG format
    if image.format != 'PNG':
        raise ValueError("Image is not in PNG format")
    return image
        
def load_models():
    det_processor, det_model = load_det_processor(), load_det_model()
    rec_model, rec_processor = load_rec_model(), load_rec_processor()
    layout_det_model = load_det_model(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
    layout_det_processor = load_det_processor(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
    return det_processor, det_model, layout_det_model, layout_det_processor, rec_model, rec_processor

def convert_bbox_to_relative(bbox, image_bbox):
    return {
        "left": bbox[0] / (image_bbox[2] - image_bbox[0]), 
        "top": bbox[1] / (image_bbox[3] - image_bbox[1]),
        "width": (bbox[2] - bbox[0]) / (image_bbox[2] - image_bbox[0]),
        "height": (bbox[3] - bbox[1]) / (image_bbox[3] - image_bbox[1])
    }

def convert_bbox_to_id(bbox):
    return f"{bbox[0]:.1f}-{bbox[1]:.1f},{bbox[2]:.1f},{bbox[3]:.1f}"

def process_detection_result(text_lines, layout_blocks, image_bbox):
    # match lines to layout
    # return a list of layout objects with the line text
    blocks = []
    lines = [{'boundingBox': convert_bbox_to_relative(line.bbox, image_bbox), 'text': line.text, "id": convert_bbox_to_id(line.bbox)} for line in text_lines]
    for block in layout_blocks:
        lines_in_block = []
        for line in text_lines:
            if line.bbox[0] >= block.bbox[0] - 2 and line.bbox[1] >= block.bbox[1] - 2 and line.bbox[2] < block.bbox[2] + 2 and line.bbox[3] < block.bbox[3] + 2:
                lines_in_block.append(line)
        text = "\n".join([line.text for line in lines_in_block])
        blocks.append({ "text": text, "boundingBox": convert_bbox_to_relative(block.bbox, image_bbox), "id": convert_bbox_to_id(block.bbox) })
    return lines, blocks

def analyze_image(input_path, output_path):
    image = load_image(input_path)
    print(image.width, image.height)
    langs = ["en"] # Replace with your languages - optional but recommended
    det_processor, det_model, layout_det_model, layout_det_processor, rec_model, rec_processor = load_models()
    line_predictions = batch_text_detection([image], det_model, det_processor)
    line_polygons = [p.polygon for p in line_predictions[0].bboxes]
    # line_bbox_image = draw_polys_on_image(line_polygons, copy.deepcopy(image))
    # line_bbox_image.save("./data/line_bbox_image.png")
    layout_predictions = batch_layout_detection([image], layout_det_model, layout_det_processor, line_predictions)
    # polygons = [p.polygon for p in layout_predictions[0].bboxes]
    # labels = [p.label for p in layout_predictions[0].bboxes]
    # bbox_image = draw_polys_on_image(polygons, copy.deepcopy(image), labels=labels)
    # bbox_image.save("./data/bbox_image.png")
    text_recognition = run_recognition([image], [langs], rec_model, rec_processor, None, [line_polygons])
    lines, blocks = process_detection_result(text_recognition[0].text_lines, layout_predictions[0].bboxes, layout_predictions[0].image_bbox)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            "lines": lines,
            "blocks": blocks
        }, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    input_path = os.getenv("INPUT")
    output_path = os.getenv("OUTPUT")
    while True:
        command = sys.stdin.readline().strip()
        if command == "run":
            analyze_image(input_path, output_path)
            sys.stdout.write("done\n")
            sys.stdout.flush()
        elif command == "exit":
            break
