#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import os.path
import urllib
import MeCab
import random
import re
import json
import sys
import pytz
from datetime import datetime as dt
from pymongo import MongoClient

def wakati(text):
    t = MeCab.Tagger("-Owakati")
    m = t.parse(text)
    result = m.rstrip(" \n").split(" ")
    return result

def main():
    argvs = sys.argv
    argc = len(argvs)
    token = argvs[1]
    print token
    files = os.listdir("data")
    for file in files:
        if os.path.getsize("data/" + file) == 0:
            continue
        f = open("data/" + file, 'r')
        jsonData = json.load(f)
        f.close()
        text = '';
        for data in jsonData:
            if data['text'] == '':
                continue
            m0 = re.match(r"^<(@|http).*$", str(data['text']))
            m1 = re.match(r"^#\w{3,6}.*$", str(data['text']))
            m2 = re.match(r"^```$", str(data['text']))
            if (m0 == None and m1 == None and m2 == None):
                text = text + str(data['text'])
        wordlist = wakati(text)
        markov = {}
        w1=''
        w2=''
        w3=''
        for word in wordlist:
            if w1 and w2 and w3:
                if (w1,w2,w3) not in markov:
                    markov[(w1,w2,w3)] = []
                markov[(w1,w2,w3)].append(word)
            w1,w2,w3=w2,w3,word
        count = 0
        sentence = ''
        w1,w2,w3 = random.choice(markov.keys())
        while count < 1000:
            if markov.has_key((w1,w2,w3)) == True:
                tmp = random.choice(markov[(w1,w2,w3)])
                sentence += tmp
            w1,w2,w3 = w2,w3,tmp
            count += 1
        sentence = re.sub("^.+?。", "", sentence)
        sentence = re.sub("^」", "", sentence)
        if re.search(r".+。", sentence) != None:
            sentence = re.search(r".+。", sentence).group()
        client = MongoClient()
        db = client.kakukaku
        collection = db.summarySlack
        collection.insert({'date': dt.strptime(file[0:10], '%Y-%m-%d'), 'text': sentence})
        print sentence

if __name__ == '__main__':
    main()
