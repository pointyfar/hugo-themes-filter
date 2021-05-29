#### Who 

Hello! I am PointyFar and I like cats. And filtering things.

See my other project here:

  - [Generic filtering for Hugo](https://github.com/pointyfar/hugo-tags-filter) [(Demo here)](https://pointy.netlify.com/filter/)

#### What 

**PFHT: PointyFar's Filterable Hugo Themes** lets you filter through Hugo themes by tags, license, and Hugo version. 
  
- **NEW:** (05 Sep 2018) Moved to Bulma!
  - Also now using Hugo Pipes

- **NEW:** (03 Sep 2018) GitHub stars added!
  - Also last updated date (GitHub hosted repos only)
  - Soon (/someday): sort by stars
  
---

- **NEW:** Search Bar added!
  - Tags search
  - Main search: searches the contents of the theme 'boxes'. 
    - Note: Still a WIP. Currently, if you want to use the main search box in addition to tags or the other buttons, you have to select the other buttons **first** then type your search term. Otherwise selecting a button clears the search box.

#### Why

I wrote this project because I wanted to easily filter Hugo themes using more than a single tag at a time.

#### Where 

Code is hosted on [github](https://github.com/pointyfar/hugo-themes-filter).

#### How 

I `git submodule`-d the [Hugo themes repo](https://github.com/gohugoio/hugoThemes). A bit of `gulp`-ing produces  `data/themes.json` which I then use to extract data from.

#### Whooops

Find something broken? Do let me know by emailing me at [pointyfar@gmail.com](mailto:pointyfar@gmail.com)! 


**Updating Themes**

```
git submodule foreach git pull origin master
cd all-themes
git submodule update --init
cd ../
gulp themes
```
