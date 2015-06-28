#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import os.path
import urllib
import MeCab
import random
import re
import json
from pymongo import MongoClient

def wakati(text):
    t = MeCab.Tagger("-Owakati")
    m = t.parse(text)
    result = m.rstrip(" \n").split(" ")
    return result

def main():
    files = os.listdir("../data")
    for file in files:
        if os.path.getsize("../data/" + file) == 0:
            continue
        f = open("../data/" + file, 'r')
        jsonData = json.load(f)
        f.close()
        text = '';
        for data in jsonData:
            text = text + str(data['text']) + '\n'
        print text
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
        while count < 100:
            if markov.has_key((w1,w2,w3)) == True:
                tmp = random.choice(markov[(w1,w2,w3)])
                sentence += tmp
            w1,w2,w3 = w2,w3,tmp
            count += 1
        # sentence = re.sub("^.+?。", "", sentence)
        print sentence


if __name__ == '__main__':
    main()
