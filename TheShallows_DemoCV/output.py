"""
Reads from a queue to retrieve collections of ROIs cut from a single frame by the corresponding input class.
Has two loops: 
#1 carries out the aforementioned queue read
#2 runs in between, averaging the collections of ROIs into eachother parametrically.
"""
