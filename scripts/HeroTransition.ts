/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />

module ngFragments {


    export class HeroTransition {


        private heroAnimators:any[] = [];

        private pairs:any[] = [];

        private sourcePaper:HTMLElement;
        private destinationPaper:HTMLElement;
        private container:HTMLElement;

        private sourceBounds:ClientRect;
        private containerBounds:ClientRect;
        private destPaperBounds:ClientRect;

        private sourcePaperElement:ng.IAugmentedJQuery;
        private destinationPaperElement:ng.IAugmentedJQuery;
        private containerElement:ng.IAugmentedJQuery;

        private animationPaper:ng.IAugmentedJQuery;

        public start(sourceEl, destEl, containerEl) {

            this.initializeElements(sourceEl, destEl, containerEl);

            this.buildAnimationPaper();

            this.startTransition(()=>{
                this.endTransition();
            });
        }

        private initializeElements(sourceEl:string, destEl:string, containerEl:string) {
            this.sourcePaper = document.getElementById(sourceEl);
            this.destinationPaper = document.getElementById(destEl);
            this.container = document.getElementById(containerEl);

            this.sourceBounds = this.sourcePaper.getBoundingClientRect();
            this.containerBounds = this.container.getBoundingClientRect();
            this.destPaperBounds = this.destinationPaper.getBoundingClientRect();

            this.sourcePaperElement = angular.element(this.sourcePaper);
            this.containerElement = angular.element(this.container);
            this.destinationPaperElement = angular.element(this.destinationPaper);
        }

        private buildAnimationPaper() {
            this.animationPaper = angular.element('<div></div>');
            this.containerElement.append(this.animationPaper);

            var destinationSurface = this.destPaperBounds.width * this.destPaperBounds.height;
            var sourceSurface = this.sourceBounds.width * this.sourceBounds.height;
            var self = this;
            var targetColor = window.getComputedStyle(self.destinationPaper, null).getPropertyValue('background-color');
            if(destinationSurface < sourceSurface){
                targetColor = window.getComputedStyle(self.sourcePaper, null).getPropertyValue('background-color');
            }
            var animate = function(){
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


        }

        private startTransition(callback) {
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

        }

        private endTransition(){
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
        }

        private cleanupHeroesAnimators() {
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
        }

        private animateExpand() {
            var self = this;
            setTimeout(function () {
                self.expandCSS();
            }, 5);

        }

        private expandCSS(){
            var transform = 'translate3d(' + (this.destPaperBounds.left - this.sourceBounds.left) + 'px, '
                + (this.destPaperBounds.top - this.sourceBounds.top) + 'px, 0)';
            this.animationPaper.css({
                '-webkit-transform': transform,
                transform: transform,
                width: this.destPaperBounds.width + 'px',
                height: this.destPaperBounds.height + 'px'
            }).attr('class', this.destinationPaperElement.attr('class') + ' hero-animate');

        }

        public startHeroAnimation() {
            var sourceHeroes = this.sourcePaper.getElementsByClassName('hero');
            var destinationHeroes = this.destinationPaper.getElementsByClassName('hero');

            this.pairs = [];
            for (var i = 0; i < sourceHeroes.length; i++) {
                for (var j = 0; j < destinationHeroes.length; j++) {
                    if (sourceHeroes[i].attributes['hero-id'].value == destinationHeroes[j].attributes['hero-id'].value) {
                        var p = {
                            sourceHero: angular.element(sourceHeroes[i]),
                            sourceBounds : (<HTMLElement> sourceHeroes[i]).getBoundingClientRect(),
                            destHero: angular.element(destinationHeroes[j]),
                            destBounds : (<HTMLElement> destinationHeroes[j]).getBoundingClientRect()
                        };
                        this.pairs.push(p);
                    }
                }
            }

            for (var k = 0; k < this.pairs.length; k++) {
                this.animateHeroPair(this.pairs[k]);
            }
        }

        public animateHeroPair(pair) {
            pair.sourceHero.css('visibility', 'hidden');

            var movingEl:any = pair.sourceHero.clone();
            this.heroAnimators.push(movingEl);

            this.containerElement.append(movingEl);


            var fromRect = pair.sourceBounds;
            var toRect = pair.destBounds;


            // initialize Animator to source position
            movingEl.css({
                top: (fromRect.top - this.containerBounds.top) + 'px',
                left: (fromRect.left - this.containerBounds.left ) + 'px',
                //top: (fromRect.top ) + 'px',
                //left: (fromRect.left) + 'px',
                width: fromRect.width + 'px',
                height: fromRect.height + 'px',
                margin: '0',
                'z-index': 100,
                position: 'absolute',
                visibility: 'visible'
            });
            movingEl.attr('class', pair.sourceHero.attr('class'))


            var transform = 'translate3d(' + (toRect.left - fromRect.left) + 'px, '
                + (toRect.top - fromRect.top) + 'px, 0)';


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


        }

    }
}