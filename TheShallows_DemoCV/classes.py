class Region(object):
    """
        _job (string, ex. 'resize' or 'adjust' etc.)
        _data (payload pertaining to chosen job)
    """
    def __init__(self, _x, _y, _w, _h, frame):
        self.x = _x
        self.w = _w
        self.y = _y
        self.h = _h
        self.rate = 0
        self.activity_level = 0
        self.age = 0
        self.image = frame

class CVInputSettings(object):
    """
        Settings object for setting a stream and tracking motion.
        _stream_host (string, address of stream to open)
        _stream_id (internal distinction)
        _resize (target size for resizing frames)
        _thresh_sensitivity (threshold value for the delta that removes the background)
        _accumulation (float, alpha for background segmentation accumulation algo)
        _blur_radius (self exp)
        _contour_queue (Queue for outputting detected contours)
        _job_queue (Queue for responding to directives from the main process)
        _shouldflip (kind of a bullshit thing- should we reverse x vals in the stream?)
    """
    def __init__(self, _stream_location, _stream_id, _resize, _thresh_op, _thresh_sensitivity, _detection_minimum, _accumulation, _blur_radius, _data_queue, _job_queue, _shouldflip):
        self.stream_location = _stream_location
        self.stream_id = _stream_id
        self.resize = _resize
        self.thresh_op = _thresh_op
        self.thresh_sensitivity = _thresh_sensitivity
        self.detection_minimum = _detection_minimum
        self.accumulation = _accumulation
        self.blur_radius = _blur_radius
        self.data_queue = _data_queue
        self.job_queue = _job_queue
        self.shouldflip = _shouldflip