#Demos

## Hero transition

![Hero Transition](https://github.com/riana/ng-fragments/raw/master/res/ListHero.gif)

## Slide transition

![Hero Transition](https://github.com/riana/ng-fragments/raw/master/res/ListSlide.gif)


#Install

    bower install ng-fragments --save
    
#Usage

HTML Markup:

```html
<link rel="stylesheet" href="build/css/ngFragments.css"/>

<script src="bower_components/velocity/velocity.js"></script>
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-touch/angular-touch.js"></script>
<script src="build/js/ngFragments.js"></script>

```

JS :

```javascript
angular.module('yourmodule', ['ng-fragments'])...
```

Slide transition between fragments :

```html
<ng-fragment-container id="SlideContainer" default-view="SlideListView">
    <ng-fragment id="SlideListView">
        <a slide-push="'SlideDetailsView'" slide-direction="'left'">Next</a>
    </ng-fragment>
    <ng-fragment id="SlideDetailsView">
        <a slide-push="'SlideListView'" slide-direction="'right'">Back</a>
    </ng-fragment>
</ng-fragment-container>
```

Hero transition between fragments:

```html
<ng-fragment-container id="ListHeroContainer" default-view="HeroListView">
    <ng-fragment id="HeroListView">
        <!--ng-repeat here-->
        <div id="hero_1">
            <a  hero hero-id="icon"
                hero-source="'hero_1'" hero-push="'DetailView'"
                hero-container="ListHeroContainer">
                    <img src="res/profile-default.png" class="item-icon hero" hero-id="icon" alt=""/>
            </a>
            <span hero hero-id="txt">Hero #1</span>
        </div>
    </ng-fragment>
    
    <ng-fragment id="DetailView">
        <div id="top-bar">
            <a  hero 
                hero-source="'DetailView'" hero-push="'hero_1'"
                hero-container="ListHeroContainer">Back</a>
            <span class="flex huge-text hero detail-title" hero-id="txt">Hero1</span>
        </div>
        <div id="content-zone">
            <img src="res/profile-default.png" class="detail-icon hero" hero-id="icon" alt=""/>
        </div>
    </ng-fragment>

</ng-fragment-container>

```
