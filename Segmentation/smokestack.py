from skimage import transform
from skimage.transform import resize, rotate, EuclideanTransform
import numpy as np
from skimage.io import imread

def get_random_transform(I, Mask, rrange, trange):
    symrand = lambda rg: rg*(2*np.random.rand()-1)/2
    rot = symrand(rrange)
    tx = symrand(trange)
    ty = symrand(trange)
    tform = EuclideanTransform(rotation=rot, translation=(tx, ty))
    Mask = np.sum(Mask, axis=2) == 0
    Mask = transform.warp(Mask, tform)
    return transform.warp(I, tform), Mask

def get_data(start, end, size=(512, 512), n_augment=0):
    images = []
    annotations = []
    for i in range(start, end):
        print(".", end='')
        I = imread("Drone/Masks/{}.png".format(i))
        Mask = imread("Drone/Masks/{}Mask.png".format(i))
        Mask = Mask[:, :, 0:3]
        Ij, Maskj = get_random_transform(I, Mask, 0, 0)
        images.append(resize(Ij, size))
        annotations.append(resize(Maskj, size))
        # Data augmentation with random rotations and translations
        for j in range(n_augment):
            Ij, Maskj = get_random_transform(I, Mask, np.pi/8, 200)
            images.append(resize(Ij, size))
            annotations.append(resize(Maskj, size))
    images = [np.array(np.moveaxis(I, -1, 0), dtype=np.float32) for I in images]
    annotations = [np.array(I, dtype=np.float32) for I in annotations]
    return images, annotations
