"""
Reads from a queue to retrieve collections of ROIs cut from a single frame by the corresponding input class.
Has two loops: 
#1 carries out the aforementioned queue read
#2 runs in between, averaging the collections of ROIs into eachother parametrically.
"""
import logging
import time
import cv2
import imutils
import numpy as np
from classes import Region

from multiprocessing import Process, Queue, Event
from random import randint

class OutputStream(Process):
    """
    Process to handle single video stream from network
    """
    def __init__(self, OutputSettings):
        super(OutputStream, self).__init__()
        print 'Starting Output Stream'
        self.settings = OutputSettings
        self.job_queue = OutputSettings.job_queue
        self.dataqueue = OutputSettings.data_queue
        self.ht = OutputSettings.shape[1]
        self.wd = OutputSettings.shape[0]
        self.exit_event = Event()
        self.hasStarted = False
        self.hasSize = False
        self.regions = []
        self.outframe = np.zeros((self.ht, self.wd, 3), np.uint8)
        self.cont = True

    def run(self):
        while not self.hasStarted:
            cv2.startWindowThread()
            cv2.namedWindow("view", cv2.WND_PROP_FULLSCREEN)
            #cv2.setWindowProperty("view",cv2.WND_PROP_FULLSCREEN,cv2.WINDOW_FULLSCREEN)
        while self.cont:
            if not self.job_queue.empty():
                currentjob = self.job_queue.get()
                if currentjob.job == "RESIZE":
                    self.adjustFrame(currentjob.payload)
            if not self.dataqueue.empty():
                ROIs = self.dataqueue.get()
                #self.compile(ROIs)
                self.outframe = ROIs
            if self.hasSize:
                self.play(self.outframe)

    def adjustFrame(self, shape):
        """
        Runs when we receive a shape from the video stream.
        """
        self.ht = shape[0]
        self.wd = shape[1]
        self.outframe = np.zeros((self.ht, self.wd, 3), np.uint8)
        self.hasSize = True

    def compile(self, collection):
        """
            Do our parameterized averaging procedure and whatever else doesn't happen every frame.
        """
        
        return 0

    def play(self, frame):
        """
            Step between current frame and desired one somehow.
            Intended output is the self.outframe image.
        """
        cv2.imshow("view", frame)
        return 0

    def stop(self):
        print 'Terminating...'
        self.cont = False
        self.exit_event.set()
