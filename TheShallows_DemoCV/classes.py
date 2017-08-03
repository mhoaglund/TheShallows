class Region(object):
    """
        _job (string, ex. 'resize' or 'adjust' etc.)
        _data (payload pertaining to chosen job)
    """
    def __init__(self, _x, _y, _w, _h):
        self.x = _x
        self.w = _w
        self.y = _y
        self.h = _h
        self.rate = 0
        self.activity_level = 0
        self.age = 0