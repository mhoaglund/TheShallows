import logging
import os
import datetime
import time
from multiprocessing import Process, Queue, Event
import schedule
import cv2
import imutils
import numpy as np
from classes import CVInputSettings, CVOutputSettings
from inputstream import InputStream
from outputstream import OutputStream

JOBQUEUE = Queue()
DATAQUEUE = Queue()

SHALLOWS_STREAM = CVInputSettings(
    "rtsp://10.254.239.5:554/11.cgi",
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

SHALLOWS_OUT = CVOutputSettings(
    0.03,
    DATAQUEUE,
    JOBQUEUE,
    0,
    0
)

PROCESSES = []

def spinupstreams():
    """Set up the two opencv stream processes"""
    global _inputprocess
    global _outputprocess
    if __name__ == "__main__":
        _inputprocess = InputStream(SHALLOWS_STREAM)
        PROCESSES.append(_inputprocess)
        _outputprocess = OutputStream(SHALLOWS_OUT)
        PROCESSES.append(_outputprocess)
        for proc in PROCESSES:
            proc.start()

def stopworkerthreads():
    """Stop any currently running threads"""
    for proc in PROCESSES:
        proc.stop()

spinupstreams()

try:
    while True:
        print 0 #pretty sure there'll be something here
except (KeyboardInterrupt, SystemExit):
    time.sleep(1)
    stopworkerthreads()