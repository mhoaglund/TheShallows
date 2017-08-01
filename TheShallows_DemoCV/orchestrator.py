import logging
import os
import datetime
import time
from multiprocessing import Process, Queue, Event
import schedule
import cv2
import imutils
import numpy as np

class InputStream(Process):
    """
    Process to handle single video stream from network
    """
    def __init__(self, InputSettings):
        super(InputStream, self).__init__()
        print 'Starting Input Stream'

    def run(self):
        while self.cont:
            return 0

    def stop(self):
        print 'Terminating...'
        self.cont = False
        self.exit_event.set()

    def refresh(self):
        logging.info('Experiencing a problem with stream %s, rebooting', self.stream_id)
        self.vcap.release()
        self.hasStarted = False