#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import os.path
import urllib
import MeCab
import random
import re
import json
import pytz
from datetime import datetime as dt
from pymongo import MongoClient

def main():
    client = MongoClient()
    db = client.kakukaku
    collection = db.chatSlack
    f = open("test/data/angelhack.json", 'r')
    jsonData = json.load(f)
    f.close()
    for data in jsonData['messages']:
        collection.insert({'ts': data['ts'], 'user': data['user'], 'text': data['text'], 'channel': 'G06F3GPGS', 'date': datetime.now(pytz.timezone('Asia/Tokyo'))})

if __name__ == '__main__':
    main()
