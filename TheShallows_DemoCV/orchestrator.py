import logging
import os
import datetime
import time
from multiprocessing import Process, Queue, Event
import schedule
import cv2
import imutils
import numpy as np
from classes import CVInputSettings
from inputstream import InputStream

JOBQUEUE = Queue()
DATAQUEUE = Queue()

SHALLOWS_STREAM = CVInputSettings(
    "rtsp://10.254.239.7:554/11.cgi",
    0,
    1270,
    cv2.THRESH_BINARY,
    40,
    24,
    0.03,
    5,
    DATAQUEUE,
    JOBQUEUE,
    False
)

FEED = InputStream(SHALLOWS_STREAM)
