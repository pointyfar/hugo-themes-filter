---
title: "About"
date: 2018-04-14T15:57:33+10:00
draft: false
menu:
  main:
    title: "about pointyfar"
    identifier: "about"
    weight: 110
---

#### Who 

Hello! I am PointyFar and I am new(-ish) to Hugo. I like cats.

#### What 

This project lets you filter through Hugo themes by tags, license, and Hugo version. 

#### Why

I wrote this project because I wanted to easily filter Hugo themes using more than a single tag at a time.

#### Where 

Code is hosted on [github](https://github.com/pointyfar/hugo-themes-filter).

#### How 

I `git submodule`-d the [Hugo themes repo](https://github.com/gohugoio/hugoThemes). A bit of `gulp`-ing produces  `data/themes.json` which I then use to extract data from.