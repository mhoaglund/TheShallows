import logging
import time
import cv2
import imutils
import numpy as np
from classes import Region, PlayerJob

from multiprocessing import Process, Queue, Event
from random import randint

class InputStream(Process):
    """
    Process to handle single video stream from network
    """
    def __init__(self, InputSettings):
        super(InputStream, self).__init__()
        print 'Starting Input Stream'
        self.settings = InputSettings
        self.vcap = cv2.VideoCapture()
        self.job_queue = InputSettings.job_queue
        self.data_queue = InputSettings.data_queue
        self.firstFrame = None
        self.avg = None
        self.exit_event = Event()
        self.hasStarted = False
        self.hasMasked = False
        self.gridx = 5
        self.gridy = 4
        self.regions = []

    def run(self):
        while not self.exit_event.is_set():
            if not self.job_queue.empty():
                currentjob = self.job_queue.get()
                if currentjob.job == "REFRESH":
                    self.vcap.release()
                    cv2.waitKey(1)
                    cv2.destroyAllWindows()
                    cv2.waitKey(1)
                    time.sleep(5)
                    self.vcap = cv2.VideoCapture()
                    self.hasStarted = False

            if self.hasStarted is False:
                logging.info('Performing stream setup on input stream')
                self.vcap = cv2.VideoCapture(self.settings.stream_location)
                cv2.startWindowThread()
                self.output = cv2.namedWindow("view", cv2.CV_WINDOW_AUTOSIZE)
                self.hasStarted = True

            try:
                (grabbed, frame) = self.vcap.read()
            except cv2.error as e:
                logging.error('Opencv: %s', e)
                continue

            if not grabbed or type(frame) is None:
                logging.info('Grab failed...')
                continue

            #frame = imutils.resize(frame, width=1720)
            if not self.hasMasked:
                self.shouldmask = self.generateMasks(frame)
                sizejob = PlayerJob("RESIZE", frame.shape)
                self.job_queue.put(sizejob)
                self.hasMasked = True
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            if self.avg == None:
                self.avg = np.float32(gray)
            cv2.accumulateWeighted(gray, self.avg, self.settings.accumulation)
            if self.firstFrame is None:
                self.firstFrame = gray
                continue

            avgres = cv2.convertScaleAbs(self.avg)
            frame_delta = cv2.absdiff(avgres, gray)
            thresh = cv2.threshold(frame_delta,
                                   self.settings.thresh_sensitivity,
                                   255,
                                   cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=3)
            #TODO: some bitwise stuff with the thresh so we can spot "levels of movement" within sectors
            #self.updateRegions(frame)
            self.data_queue.put(avgres)
            cv2.waitKey(20)
        self.vcap.release()
        print 'Released Capture'
        cv2.waitKey(1)
        cv2.destroyAllWindows()
        cv2.waitKey(1)

    def stop(self):
        print 'Terminating...'
        self.cont = False
        self.exit_event.set()

    def refresh(self):
        logging.info('Experiencing a problem with stream, rebooting')
        self.vcap.release()
        self.hasStarted = False

    #Intent: generate grid of masks in consistent space
    #desired output is a grid of rects
    def generateMasks(self, _frame):
        """
        Generate a grid of masks using frame.
        """
        unitw = _frame.shape[1]/self.gridx
        unith = _frame.shape[0]/self.gridy
        #img = img[c1:c1+25,r1:r1+25]
        for x in range(0, self.gridx):
            for y in range(0, self.gridy):
                _subimg = _frame[x*unitw:x*unitw+unitw,y*unith:y*unith+unith]
                _thisregion = Region(
                    x*unitw,
                    y*unith,
                    unitw,
                    unith,
                    _subimg
                )
                self.regions.append(_thisregion)
        return 0

    def updateRegions(self, _frame):
        for region in self.regions:
            img = _frame[region.x:region.x+region.w,region.y:region.y+region.h]