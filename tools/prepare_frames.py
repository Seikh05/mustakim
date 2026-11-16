"""Crop/center the 17 face photos into 400x400 frames, ordered by head yaw.

Face boxes come from OpenCV Haar detection (frontal / profile cascades), curated
by hand where sunglasses defeat the detector. ORDER is a manual yaw sweep
(image-left profile -> frontal -> image-right), since landmark-based yaw
estimation is unreliable with sunglasses.

Usage: python tools/prepare_frames.py
"""
import glob, os
import cv2

SRC = "assets/mustakim_face"
OUT = os.path.join(SRC, "frames")
SIZE, QUALITY, PAD = 400, 85, 1.75

# index into sorted(glob) -> (x, y, size) square face box in original pixels
BOX = {
    0: (612, 158, 450), 1: (566, 625, 335), 2: (471, 773, 288), 3: (471, 581, 390),
    4: (418, 492, 446), 5: (394, 734, 289), 6: (520, 873, 216), 7: (494, 564, 339),
    8: (560, 651, 376), 9: (537, 646, 329), 10: (537, 570, 273), 11: (453, 597, 292),
    12: (443, 546, 292), 13: (494, 693, 221), 14: (605, 704, 195), 15: (418, 634, 332),
    16: (519, 662, 266),
}
# far image-left yaw -> frontal -> far image-right yaw (excluding black t-shirt photos 0 & 1)
ORDER = [4, 3, 9, 8, 5, 12, 11, 16, 2, 6, 15, 10, 14, 13, 7]


def crop(im, box):
    x, y, w = box
    s = int(w * PAD)
    cx, cy = x + w / 2, y + w / 2 - w * 0.04
    H, W = im.shape[:2]
    s = min(s, H, W)
    x0 = int(min(max(cx - s / 2, 0), W - s))
    y0 = int(min(max(cy - s / 2, 0), H - s))
    return cv2.resize(im[y0:y0 + s, x0:x0 + s], (SIZE, SIZE), interpolation=cv2.INTER_AREA)


def main():
    files = sorted(glob.glob(os.path.join(SRC, "*.jp*g")))
    assert len(files) == 17, len(files)
    os.makedirs(OUT, exist_ok=True)
    for old in glob.glob(os.path.join(OUT, "frame_*.jpg")):
        os.remove(old)
    for n, idx in enumerate(ORDER, 1):
        fr = crop(cv2.imread(files[idx]), BOX[idx])
        cv2.imwrite(os.path.join(OUT, f"frame_{n:02d}.jpg"), fr, [cv2.IMWRITE_JPEG_QUALITY, QUALITY])
    print("wrote", len(ORDER), "frames to", OUT)


if __name__ == "__main__":
    main()
