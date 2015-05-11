/**
 * Created by riana on 26/04/15.
 */
/// <reference path='../typings/_all.ts' />
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    'use strict';
    var HeroDemoController = (function () {
        function HeroDemoController($scope) {
            this.$scope = $scope;
            this.items = [];
            $scope.ctrl = this;
            for (var i = 0; i < 20; i++) {
                var item = {
                    id: i,
                    label: 'User #' + i
                };
                this.items.push(item);
            }
        }
        HeroDemoController.prototype.selectItem = function (item) {
            this.selectedItem = item;
        };
        HeroDemoController.$inject = [
            '$scope'
        ];
        return HeroDemoController;
    })();
    ngFragmentsDemo.HeroDemoController = HeroDemoController;
})(ngFragmentsDemo || (ngFragmentsDemo = {}));

/**
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='../scripts/ngFragments.ts' />
/// <reference path='HeroDemoController.ts' />
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    angular.module('transitionsdemo', ['ngFragments']).controller('HeroDemoController', ngFragmentsDemo.HeroDemoController);
})(ngFragmentsDemo || (ngFragmentsDemo = {}));

/**
 * Created by riana on 11/05/15.
 */
var ngFragments;
(function (ngFragments) {
    var ViewContainer = (function () {
        function ViewContainer(currentPage) {
            this.currentPage = currentPage;
        }
        ViewContainer.prototype.getCurrentPage = function () {
            return this.currentPage;
        };
        ViewContainer.prototype.setCurrentPage = function (currentPage) {
            this.currentPage = currentPage;
        };
        return ViewContainer;
    })();
    ngFragments.ViewContainer = ViewContainer;
    ngFragments.ViewContainers = {};
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='HeroTransition.ts' />
var ngFragments;
(function (ngFragments) {
    'use strict';
    function FragmentContainerDirective() {
        return {
            restrict: 'EA',
            link: function ($scope, element, attributes) {
                var el = angular.element(element[0]);
                var container = new ngFragments.ViewContainer(el.attr('default-view'));
                ngFragments.ViewContainers[el.attr('id')] = container;
                var defaultViewElement = angular.element(document.getElementById(el.attr('default-view')));
                defaultViewElement.addClass('transition-slide-active');
            }
        };
    }
    ngFragments.FragmentContainerDirective = FragmentContainerDirective;
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='HeroTransition.ts' />
var ngFragments;
(function (ngFragments) {
    'use strict';
    function HeroDirective() {
        return {
            restrict: 'A',
            link: function ($scope, element, attributes) {
                var heroTransition = new ngFragments.HeroTransition();
                var el = angular.element(element[0]);
                element.bind('touchstart click', function (evt) {
                    var source = $scope.$eval(el.attr('hero-source'));
                    var dest = $scope.$eval(el.attr('hero-push'));
                    var container = el.attr('hero-container');
                    heroTransition.start(source, dest, container);
                });
            }
        };
    }
    ngFragments.HeroDirective = HeroDirective;
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />
var ngFragments;
(function (ngFragments) {
    var HeroTransition = (function () {
        function HeroTransition() {
            this.heroAnimators = [];
            this.pairs = [];
        }
        HeroTransition.prototype.start = function (sourceEl, destEl, containerEl) {
            var _this = this;
            this.initializeElements(sourceEl, destEl, containerEl);
            this.buildAnimationPaper();
            this.startTransition(function () {
                _this.endTransition();
            });
        };
        HeroTransition.prototype.initializeElements = function (sourceEl, destEl, containerEl) {
            this.sourcePaper = document.getElementById(sourceEl);
            this.destinationPaper = document.getElementById(destEl);
            this.container = document.getElementById(containerEl);
            this.sourceBounds = this.sourcePaper.getBoundingClientRect();
            this.containerBounds = this.container.getBoundingClientRect();
            this.destPaperBounds = this.destinationPaper.getBoundingClientRect();
            this.sourcePaperElement = angular.element(this.sourcePaper);
            this.containerElement = angular.element(this.container);
            this.destinationPaperElement = angular.element(this.destinationPaper);
        };
        HeroTransition.prototype.buildAnimationPaper = function () {
            this.animationPaper = angular.element('<div></div>');
            this.containerElement.append(this.animationPaper);
            var destinationSurface = this.destPaperBounds.width * this.destPaperBounds.height;
            var sourceSurface = this.sourceBounds.width * this.sourceBounds.height;
            var self = this;
            var targetColor = window.getComputedStyle(self.destinationPaper, null).getPropertyValue('background-color');
            if (destinationSurface < sourceSurface) {
                targetColor = window.getComputedStyle(self.sourcePaper, null).getPropertyValue('background-color');
            }
            var animate = function () {
                self.animationPaper.attr('class', self.sourcePaperElement.attr('class') + ' hero-animate');
                self.animationPaper.css({
                    position: 'absolute',
                    margin: 0,
                    padding: 0,
                    top: '' + (self.sourceBounds.top - self.containerBounds.top) + 'px',
                    left: '' + (self.sourceBounds.left - self.containerBounds.left) + 'px',
                    width: '' + self.sourceBounds.width + 'px',
                    height: '' + self.sourceBounds.height + 'px',
                    //'border-radius' : '50%',
                    background: targetColor,
                    'z-index': 1
                });
            };
            animate();
        };
        HeroTransition.prototype.startTransition = function (callback) {
            // Start the animation
            // - crossfade the source paper
            // - expand the Animation Surface
            // - Start hero animation
            this.animateExpand();
            this.sourcePaperElement.css({
                opacity: 0
            });
            //Velocity.animate(sourcePaperElement, {opacity: 0}, 100, function(){});
            this.startHeroAnimation();
            // Handle animation End
            // - Restore the source paper modifications
            // - Remove all animators : paper + heroes
            setTimeout(function () {
                callback();
            }, 350);
        };
        HeroTransition.prototype.endTransition = function () {
            this.sourcePaperElement.css({
                'z-index': 0
            });
            // No Opacity transition
            this.destinationPaperElement.css({
                opacity: 1,
                'z-index': 1
            });
            this.animationPaper.remove();
            this.cleanupHeroesAnimators();
            //Velocity.animate(destinationPaper, {opacity: 1}, 50, function(){
            //    animationPaper.remove();
            //    self.removeHeroesAnimators();
            //});
        };
        HeroTransition.prototype.cleanupHeroesAnimators = function () {
            for (var i in this.heroAnimators) {
                this.heroAnimators[i].remove();
            }
            this.heroAnimators.slice(0, this.heroAnimators.length);
            for (var k = 0; k < this.pairs.length; k++) {
                var pair = this.pairs[k];
                pair.sourceHero.css('visibility', 'visible');
                pair.destHero.css('visibility', 'visible');
            }
            this.pairs.slice(0, this.pairs.length);
        };
        HeroTransition.prototype.animateExpand = function () {
            var self = this;
            setTimeout(function () {
                self.expandCSS();
            }, 5);
        };
        HeroTransition.prototype.expandCSS = function () {
            var transform = 'translate3d(' + (this.destPaperBounds.left - this.sourceBounds.left) + 'px, ' + (this.destPaperBounds.top - this.sourceBounds.top) + 'px, 0)';
            this.animationPaper.css({
                '-webkit-transform': transform,
                transform: transform,
                width: this.destPaperBounds.width + 'px',
                height: this.destPaperBounds.height + 'px'
            }).attr('class', this.destinationPaperElement.attr('class') + ' hero-animate');
        };
        HeroTransition.prototype.startHeroAnimation = function () {
            var sourceHeroes = this.sourcePaper.getElementsByClassName('hero');
            var destinationHeroes = this.destinationPaper.getElementsByClassName('hero');
            this.pairs = [];
            for (var i = 0; i < sourceHeroes.length; i++) {
                for (var j = 0; j < destinationHeroes.length; j++) {
                    if (sourceHeroes[i].attributes['hero-id'].value == destinationHeroes[j].attributes['hero-id'].value) {
                        var p = {
                            sourceHero: angular.element(sourceHeroes[i]),
                            sourceBounds: sourceHeroes[i].getBoundingClientRect(),
                            destHero: angular.element(destinationHeroes[j]),
                            destBounds: destinationHeroes[j].getBoundingClientRect()
                        };
                        this.pairs.push(p);
                    }
                }
            }
            for (var k = 0; k < this.pairs.length; k++) {
                this.animateHeroPair(this.pairs[k]);
            }
        };
        HeroTransition.prototype.animateHeroPair = function (pair) {
            pair.sourceHero.css('visibility', 'hidden');
            var movingEl = pair.sourceHero.clone();
            this.heroAnimators.push(movingEl);
            this.containerElement.append(movingEl);
            var fromRect = pair.sourceBounds;
            var toRect = pair.destBounds;
            // initialize Animator to source position
            movingEl.css({
                top: (fromRect.top - this.containerBounds.top) + 'px',
                left: (fromRect.left - this.containerBounds.left) + 'px',
                //top: (fromRect.top ) + 'px',
                //left: (fromRect.left) + 'px',
                width: fromRect.width + 'px',
                height: fromRect.height + 'px',
                margin: '0',
                'z-index': 100,
                position: 'absolute',
                visibility: 'visible'
            });
            movingEl.attr('class', pair.sourceHero.attr('class'));
            var transform = 'translate3d(' + (toRect.left - fromRect.left) + 'px, ' + (toRect.top - fromRect.top) + 'px, 0)';
            setTimeout(function () {
                movingEl.css({
                    '-webkit-transform': transform,
                    transform: transform,
                    //top : (toRect.top - this.containerBounds.top) + 'px',
                    //left: (toRect.left - this.containerBounds.left)+ 'px',
                    width: toRect.width + 'px',
                    height: toRect.height + 'px'
                }).attr('class', pair.destHero.attr('class') + ' hero-animate');
            }, 0);
        };
        return HeroTransition;
    })();
    ngFragments.HeroTransition = HeroTransition;
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 11/05/15.
 */
/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='SlideTransition.ts' />
var ngFragments;
(function (ngFragments) {
    'use strict';
    function SlideDirective() {
        return {
            restrict: 'A',
            link: function ($scope, element, attributes) {
                var slideTransition = new ngFragments.SlideTransition();
                var el = angular.element(element[0]);
                element.bind('touchstart click', function (evt) {
                    var pushPage = $scope.$eval(el.attr('slide-push'));
                    var direction = $scope.$eval(el.attr('slide-direction'));
                    var container = el.attr('slide-container');
                    slideTransition.start(pushPage, direction, container);
                });
            }
        };
    }
    ngFragments.SlideDirective = SlideDirective;
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path="FragmentContainer.ts"/>
var ngFragments;
(function (ngFragments) {
    var SlideTransition = (function () {
        function SlideTransition() {
        }
        SlideTransition.prototype.start = function (pushPage, direction, container) {
            var pushDom = document.getElementById(pushPage);
            var pushElement = angular.element(pushDom);
            var parent = pushElement.parent();
            var viewContainer = ngFragments.ViewContainers[parent.attr('id')];
            var currentId = viewContainer.getCurrentPage();
            var currentElement = angular.element(document.getElementById(currentId));
            viewContainer.setCurrentPage(pushPage);
            if (direction === 'left') {
                currentElement.addClass('transition-slide-left');
                pushElement.addClass('transition-slide-active');
                currentElement.removeClass('transition-slide-active');
            }
            else if (direction === 'right') {
                currentElement.addClass('transition-slide-right');
                pushElement.addClass('transition-slide-active');
                currentElement.removeClass('transition-slide-active');
            }
        };
        return SlideTransition;
    })();
    ngFragments.SlideTransition = SlideTransition;
})(ngFragments || (ngFragments = {}));

/**
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='HeroDirective.ts' />
/// <reference path='HeroTransition.ts' />
/// <reference path='SlideDirective.ts' />
/// <reference path='SlideTransition.ts' />
/// <reference path="FragmentContainerDirective.ts"/>
var ngFragments;
(function (ngFragments) {
    angular.module('ngFragments', []).directive('hero', ngFragments.HeroDirective).directive('slidePush', ngFragments.SlideDirective).directive('ngFragmentContainer', ngFragments.FragmentContainerDirective);
})(ngFragments || (ngFragments = {}));

/**
 * Created by rr on 21/04/15.
 */
