/**
 * Created by rr on 21/04/15.
 */
/// <reference path="angularjs/angular.d.ts"/>
/// <reference path="jquery/jquery.d.ts"/> 
/**
 * Created by riana on 15/05/15.
 */
/// <reference path='../typings/_all.ts' />
var ngFragments;
(function (ngFragments) {
    'use strict';
    var dnd = angular.module('ngFragmentsDnd', []).directive('draggableFragment', ['$document', '$window', '$parse', DraggableFragmentDirective]);
    var DnDHelper = (function () {
        function DnDHelper() {
        }
        DnDHelper.getElementIndex = function (element) {
            var angParent = element.parent();
            var siblings = angParent.children();
            var index = -1;
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i] === element[0]) {
                    index = i;
                }
            }
            return index;
        };
        DnDHelper.getDnDList = function (itemEl) {
            var lm = itemEl.attr('dnd-list');
            if (lm) {
                var scope = itemEl.scope();
                if (scope)
                    return scope.$eval(lm);
            }
            return null;
        };
        DnDHelper.getDnDHandler = function (itemEl) {
            var lm = itemEl.attr('dnd-handler');
            if (lm) {
                var scope = itemEl.scope();
                if (scope)
                    return scope.$eval(lm);
            }
            return null;
        };
        DnDHelper.pointerPosition = function (e) {
            var obj;
            if (e.targetTouches !== undefined) {
                obj = e.targetTouches.item(0);
            }
            else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                obj = e.originalEvent.targetTouches.item(0);
            }
            else {
                obj = e;
            }
            return obj;
        };
        DnDHelper.hasAttribute = function (el, name) {
            return el[0] && el[0].attributes && el[0].attributes[name] != null;
        };
        DnDHelper.getDraggableAncestor = function (el) {
            if ((DnDHelper.hasAttribute(el, 'draggable-fragment') || el.attr('dnd-handler') || el.attr('dnd-list')) && !el.hasClass('drag-ghost')) {
                return el;
            }
            else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDraggableAncestor(parent);
                }
                else {
                    return null;
                }
            }
            return null;
        };
        DnDHelper.getDraggablElement = function (el) {
            //If a drop-zope is found during draggable parent - break searh an treat as a container
            if (el.attr('dnd-handler') || el.attr('dnd-list')) {
                return null;
            }
            if (DnDHelper.hasAttribute(el, 'draggable-fragment') && !el.hasClass('drag-ghost')) {
                return el;
            }
            else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDraggablElement(parent);
                }
                else {
                    return null;
                }
            }
            return null;
        };
        DnDHelper.getDragContainer = function (el) {
            if (el.attr('dnd-handler') || el.attr('dnd-list')) {
                return el;
            }
            else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDragContainer(parent);
                }
                else {
                    return null;
                }
            }
            return null;
        };
        return DnDHelper;
    })();
    ngFragments.DnDHelper = DnDHelper;
    var InsertPosition;
    (function (InsertPosition) {
        InsertPosition[InsertPosition["Before"] = 0] = "Before";
        InsertPosition[InsertPosition["After"] = 1] = "After";
    })(InsertPosition || (InsertPosition = {}));
    var DropTargetType;
    (function (DropTargetType) {
        DropTargetType[DropTargetType["Item"] = 0] = "Item";
        DropTargetType[DropTargetType["Container"] = 1] = "Container";
        DropTargetType[DropTargetType["None"] = 2] = "None";
    })(DropTargetType || (DropTargetType = {}));
    var DropTarget = (function () {
        function DropTarget() {
        }
        DropTarget.prototype.resetType = function () {
            this.type = 2 /* None */;
        };
        DropTarget.prototype.setElement = function (targetItem, insertIndex, insertPosition) {
            this.targetElement = targetItem;
            this.targetIndex = insertIndex;
            this.insertPosition = insertPosition;
            this.type = 0 /* Item */;
            //if(this.targetContainer[0] == this.targetElement[0]){
            //    this.type = DropTargetType.Container;
            //}
        };
        DropTarget.prototype.setContainer = function (targetContainer) {
            this.targetElement = null;
            this.targetIndex = null;
            this.insertPosition = null;
            this.targetContainer = targetContainer;
            this.targetDnDModel = DnDHelper.getDnDHandler(targetContainer);
            this.targetDnDList = DnDHelper.getDnDList(targetContainer);
            this.type = 1 /* Container */;
        };
        DropTarget.prototype.getTargetScope = function () {
            if (this.targetElement) {
                return this.targetElement.scope();
            }
            else if (this.targetContainer) {
                return this.targetContainer.scope();
            }
        };
        DropTarget.prototype.isDifferent = function (droptarget) {
            return true;
        };
        DropTarget.prototype.isElement = function () {
            return this.type == 0 /* Item */;
        };
        DropTarget.prototype.isContainer = function () {
            return this.type == 1 /* Container */;
        };
        DropTarget.prototype.isEmpty = function () {
            return this.type == 2 /* None */;
        };
        DropTarget.prototype.update = function (droptarget) {
            this.targetElement = droptarget.targetElement;
            this.targetIndex = droptarget.targetIndex;
            this.insertPosition = droptarget.insertPosition;
            this.targetContainer = droptarget.targetContainer;
            this.targetDnDModel = droptarget.targetDnDModel;
            this.targetDnDList = droptarget.targetDnDList;
        };
        DropTarget.prototype.accept = function (dragContext, targetIndex) {
            if (this.targetDnDModel) {
                return this.targetDnDModel.accept(dragContext.sourceObject, targetIndex);
            }
            else {
                return true;
            }
        };
        return DropTarget;
    })();
    ngFragments.DropTarget = DropTarget;
    var DropContext = (function () {
        function DropContext(dragContext) {
            this.dragContext = dragContext;
            this.dropTarget = new DropTarget();
        }
        DropContext.prototype.updateContext = function (event, dropTarget) {
            if (this.dropTarget.isDifferent(dropTarget)) {
                this.removeDropGhost();
                this.inSameContainer = false;
                if (!dropTarget.isEmpty()) {
                    this.dropGhost = this.createDropGhost();
                    this.inSameContainer = dropTarget.targetContainer[0] == this.dragContext.sourceContainer[0];
                    if (dropTarget.accept(this.dragContext, dropTarget.targetIndex)) {
                        if (dropTarget.isContainer()) {
                            if (!this.inSameContainer) {
                                dropTarget.targetContainer.append(this.dropGhost);
                            }
                        }
                        else if (dropTarget.isElement()) {
                            var containerElement = dropTarget.targetElement.parent();
                            var children = containerElement.children();
                            var insertIndex = dropTarget.targetIndex;
                            if (dropTarget.insertPosition == 0 /* Before */) {
                                insertIndex = dropTarget.targetIndex - 1;
                            }
                            if (insertIndex == -1) {
                                containerElement[0].insertBefore(this.dropGhost[0], children[0]);
                            }
                            else {
                                angular.element(children[insertIndex]).after(this.dropGhost);
                            }
                        }
                    }
                }
                this.dropTarget.update(dropTarget);
            }
        };
        DropContext.prototype.performDrop = function (dragContext) {
            if (this.dropTarget.targetDnDModel || this.dropTarget.targetDnDList) {
                if (this.dropTarget.accept(this.dragContext, this.dropTarget.targetIndex)) {
                    dragContext.dropPerformed();
                    var targetIndex = this.dropTarget.targetIndex;
                    var targetDnDModel = this.dropTarget.targetDnDModel;
                    var targetPosition = this.dropTarget.insertPosition;
                    var targetDnDList = this.dropTarget.targetDnDList;
                    var self = this;
                    var targetScope = this.dropTarget.getTargetScope();
                    if (targetScope) {
                        targetScope.$apply(function () {
                            var insertIndex = targetIndex;
                            if (targetPosition == 1 /* After */ && !self.inSameContainer) {
                                insertIndex = targetIndex + 1;
                            }
                            if (targetDnDModel) {
                                targetDnDModel.add(dragContext.sourceObject, insertIndex);
                            }
                            else if (targetDnDList) {
                                if (insertIndex == null) {
                                    targetDnDList.push(dragContext.sourceObject);
                                }
                                else {
                                    targetDnDList.splice(insertIndex, 0, dragContext.sourceObject);
                                }
                            }
                        });
                    }
                }
            }
        };
        DropContext.prototype.createDropGhost = function () {
            var ghost = this.dragContext.sourceElement.clone(true);
            ghost.addClass('drop-ghost');
            ghost.removeAttr('ng-repeat');
            ghost.removeAttr('draggable-fragment');
            ghost.removeClass('ng-pristine ng-untouched ng-valid ng-scope');
            return ghost;
        };
        DropContext.prototype.removeDropGhost = function () {
            if (this.dropGhost) {
                this.dropGhost.remove();
                this.dropGhost = null;
            }
        };
        DropContext.prototype.dispose = function () {
            this.removeDropGhost();
        };
        return DropContext;
    })();
    ngFragments.DropContext = DropContext;
    var DragContext = (function () {
        function DragContext(sourceElement) {
            this.sourceElement = sourceElement;
            this.sourceContainer = this.sourceElement.parent();
            this.sourceScope = this.sourceElement.scope();
            this.sourceIndex = DnDHelper.getElementIndex(this.sourceElement);
            this.sourceDnDModel = DnDHelper.getDnDHandler(this.sourceContainer);
            this.sourceDnDList = DnDHelper.getDnDList(this.sourceContainer);
            if (this.sourceDnDModel) {
                this.sourceObject = this.sourceDnDModel.itemAt(this.sourceIndex);
            }
            else if (this.sourceDnDList) {
                this.sourceObject = this.sourceDnDList[this.sourceIndex];
            }
        }
        DragContext.prototype.init = function (e) {
            this.createDragGhost();
            this.updateDragGhostLocation(e);
        };
        DragContext.prototype.createDragGhost = function () {
            var rect = this.sourceElement[0].getBoundingClientRect();
            this.dragGhost = this.sourceElement.clone(true);
            this.dragGhost.removeAttr('ng-repeat');
            this.dragGhost.removeAttr('draggable-fragment');
            this.dragGhost.removeClass('ng-pristine ng-untouched ng-valid ng-scope');
            document.body.appendChild(this.dragGhost[0]);
            this.sourceElement.css({
                opacity: 0.5
            });
            this.dragGhost.css({
                'z-index': 12,
                //background: '#ff0000',
                position: 'absolute',
                width: '' + rect.width + 'px',
                height: '' + rect.height + 'px',
                top: '' + (rect.top) + 'px',
                left: '' + (rect.left) + 'px'
            });
        };
        DragContext.prototype.updateDragGhostLocation = function (e) {
            var pos = DnDHelper.pointerPosition(e);
            //console.log(e);
            var winX = pos.clientX + document.body.scrollLeft;
            var winY = pos.clientY + document.body.scrollTop;
            this.dragGhost.css({
                top: '' + (winY + 10) + 'px',
                left: '' + (winX + 10) + 'px'
            });
        };
        DragContext.prototype.dropPerformed = function () {
            var self = this;
            if (this.sourceDnDModel) {
                if (this.sourceDnDModel.pull) {
                    this.sourceScope.$apply(function () {
                        self.sourceDnDModel.remove(self.sourceObject);
                    });
                }
            }
            else if (this.sourceDnDList) {
                var index = self.sourceDnDList.indexOf(self.sourceObject);
                if (index != -1) {
                    self.sourceDnDList.splice(index, 1);
                }
            }
        };
        DragContext.prototype.dispose = function () {
            this.dragGhost.remove();
            this.sourceElement.css({
                opacity: 1
            });
        };
        return DragContext;
    })();
    ngFragments.DragContext = DragContext;
    function DraggableFragmentDirective($document, $window, $parse) {
        return {
            restrict: 'A',
            link: function ($scope, element, attributes) {
                var dragContext;
                var dropContext;
                var dragHandle = element;
                var handles = element[0].getElementsByClassName('drag-handle');
                if (handles.length > 0) {
                    dragHandle = angular.element(handles[0]);
                }
                dragHandle.bind('touchstart mousedown', function (e) {
                    dragContext = new DragContext(element);
                    dropContext = new DropContext(dragContext);
                    dragStart(e);
                });
                function dragStart(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    //console.log('Drag Start');
                    dragContext.init(e);
                    // Bind Events
                    angular.element($document).bind('touchend', dragEnd);
                    angular.element($document).bind('touchcancel', dragEnd);
                    angular.element($document).bind('mouseup', dragEnd);
                    angular.element($document).bind('touchmove', dragMove);
                    angular.element($document).bind('mousemove', dragMove);
                    angular.element($document).bind('mouseleave', dragCancel);
                }
                function dragEnd(e) {
                    //console.log('Drag End');
                    dropContext.performDrop(dragContext);
                    dragContext.dispose();
                    dropContext.dispose();
                    angular.element($document).unbind('touchend', dragEnd); // Mobile
                    angular.element($document).unbind('touchcancel', dragEnd); // Mobile
                    angular.element($document).unbind('touchmove', dragMove); // Mobile
                    angular.element($document).unbind('mouseup', dragEnd);
                    angular.element($document).unbind('mousemove', dragMove);
                    angular.element($document).unbind('mouseleave', dragCancel);
                }
                function dragCancel(e) {
                    dragContext.dispose();
                    dropContext.dispose();
                    //console.log('Drag Cancel');
                }
                function clearSelectionOnDrag() {
                }
                // TODO Vieux hack filtre de seuil position
                var lastX = 0;
                var lastY = 0;
                function dragMove(e) {
                    //console.log('Drag Move');
                    //console.log(e);
                    e.preventDefault();
                    //Clear selection on drag
                    if ($window.getSelection) {
                        $window.getSelection().removeAllRanges();
                    }
                    else if ($window.document.selection) {
                        $window.document.selection.empty();
                    }
                    dragContext.updateDragGhostLocation(e);
                    // TODO Vieux hack filtre de seuil position
                    var pos = DnDHelper.pointerPosition(e);
                    var winX = pos.clientX;
                    var winY = pos.clientY;
                    //var winX = pos.pageX;
                    //var winY = pos.pageY;
                    var fx = winX - lastX;
                    var fy = winY - lastY;
                    if (Math.abs(fx) > 10 || Math.abs(fy) > 10) {
                        lastX = winX;
                        lastY = winY;
                    }
                    else {
                        return;
                    }
                    //END vieux hack
                    var dropTarget = new DropTarget();
                    var hoverElement = angular.element($window.document.elementFromPoint(winX, winY));
                    //console.log("Hover %o", $window.document.elementFromPoint(winX, winY));
                    dropTarget.resetType();
                    var targetContainer = DnDHelper.getDragContainer(hoverElement);
                    if (targetContainer) {
                        dropTarget.setContainer(targetContainer);
                    }
                    var targetItem = DnDHelper.getDraggablElement(hoverElement);
                    if (targetItem) {
                        var targetItemBounds = targetItem[0].getBoundingClientRect();
                        var dy = winY - targetItemBounds.top;
                        var insertIndex = DnDHelper.getElementIndex(targetItem);
                        var insertPosition = 1 /* After */;
                        if (dy < targetItemBounds.height / 2) {
                            insertPosition = 0 /* Before */;
                        }
                        dropTarget.setElement(targetItem, insertIndex, insertPosition);
                    }
                    dropContext.updateContext(e, dropTarget);
                }
                function getDraggableIndex(el) {
                    var angParent = el.parent();
                    var siblings = angParent.children();
                    var index = -1;
                    for (var i = 0; i < siblings.length; i++) {
                        if (siblings[i] === el[0]) {
                            index = i;
                        }
                    }
                    return index;
                }
                function isDropGhost(el) {
                    if (el.hasClass('drag-ghost')) {
                        return true;
                    }
                    else {
                        var parent = el.parent();
                        if (parent.length != 0) {
                            return isDropGhost(parent);
                        }
                        else {
                            return false;
                        }
                    }
                    return false;
                }
            }
        };
    }
    ngFragments.DraggableFragmentDirective = DraggableFragmentDirective;
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
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path="DraggableFragment.ts"/>
/// <reference path='HeroDirective.ts' />
/// <reference path='HeroTransition.ts' />
/// <reference path='SlideDirective.ts' />
/// <reference path='SlideTransition.ts' />
/// <reference path="FragmentContainerDirective.ts"/>
var ngFragments;
(function (ngFragments) {
    angular.module('ngFragments', ['ngFragmentsDnd']).directive('hero', ngFragments.HeroDirective).directive('slidePush', ngFragments.SlideDirective).directive('ngFragmentContainer', ngFragments.FragmentContainerDirective);
})(ngFragments || (ngFragments = {}));
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
 * Created by riana on 15/05/15.
 */
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    ngFragmentsDemo.guid = guid;
    var Item = (function () {
        function Item() {
            this.children = [];
            this.isPrototype = true;
            var self = this;
            this.dragController = {
                pull: true,
                accept: function (newItem, index) {
                    //console.log("Item Accept : %o @ %o @ %o", self.label, newItem, index);
                    return self != newItem;
                },
                itemAt: function (index) {
                    return self.children[index];
                },
                add: function (newItem, index) {
                    var item = newItem.createNew();
                    if (index == null) {
                        self.children.push(item);
                    }
                    else {
                        self.children.splice(index, 0, item);
                    }
                },
                remove: function (item) {
                    var index = self.children.indexOf(item);
                    if (index != -1) {
                        self.children.splice(index, 1);
                    }
                    console.log('removing : %o', index);
                }
            };
        }
        Item.prototype.createNew = function () {
            var newItem = new Item();
            newItem.id = ngFragmentsDemo.guid();
            newItem.kind = this.kind;
            newItem.label = this.label;
            newItem.containsChildren = this.containsChildren;
            newItem.isPrototype = false;
            return newItem;
        };
        Item.prototype.remove = function (index) {
            this.children.slice(index, 1);
        };
        return Item;
    })();
    ngFragmentsDemo.Item = Item;
    ngFragmentsDemo.ItemPrototypes = [];
    for (var i = 0; i < 12; i++) {
        var kind = 'action';
        var containsChildren = true;
        if (i > 2) {
            containsChildren = false;
            kind = 'check';
        }
        var item = new Item();
        item.kind = kind;
        item.label = "item " + i;
        item.containsChildren = containsChildren;
        ngFragmentsDemo.ItemPrototypes.push(item);
    }
})(ngFragmentsDemo || (ngFragmentsDemo = {}));
/**
 * Created by riana on 15/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path="Item.ts"/>
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    'use strict';
    var DnDRawController = (function () {
        function DnDRawController($scope) {
            this.$scope = $scope;
            this.itemPrototypes = [];
            this.sequence = new ngFragmentsDemo.Item();
            $scope.ctrl = this;
            this.itemPrototypes = [].concat(ngFragmentsDemo.ItemPrototypes);
            this.sequence.kind = 'action';
            this.sequence.containsChildren = true;
            this.sequence.label = 'Sequence E';
            var self = this;
            this.dragController = {
                pull: false,
                accept: function (newItem, index) {
                    return false;
                },
                itemAt: function (index) {
                    return self.itemPrototypes[index];
                },
                add: function (newItem, index) {
                },
                remove: function (item) {
                }
            };
        }
        DnDRawController.$inject = [
            '$scope'
        ];
        return DnDRawController;
    })();
    ngFragmentsDemo.DnDRawController = DnDRawController;
})(ngFragmentsDemo || (ngFragmentsDemo = {}));
/**
 * Created by riana on 20/05/15.
 */
/// <reference path='../typings/_all.ts' />
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    'use strict';
    var DnDReorderListController = (function () {
        function DnDReorderListController($scope) {
            this.$scope = $scope;
            this.myItems = [];
            $scope.ctrl = this;
            for (var i = 0; i < 5; i++) {
                var item = {
                    label: 'Item #' + i
                };
                this.myItems.push(item);
            }
        }
        DnDReorderListController.$inject = [
            '$scope'
        ];
        return DnDReorderListController;
    })();
    ngFragmentsDemo.DnDReorderListController = DnDReorderListController;
})(ngFragmentsDemo || (ngFragmentsDemo = {}));
/**
 * Created by riana on 11/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='../scripts/ngFragments.ts' />
/// <reference path='HeroDemoController.ts' />
/// <reference path='DnDRawController.ts' />
/// <reference path='Item.ts' />
/// <reference path='DnDReorderListController.ts' />
var ngFragmentsDemo;
(function (ngFragmentsDemo) {
    angular.module('transitionsdemo', ['ngFragments']).controller('HeroDemoController', ngFragmentsDemo.HeroDemoController).controller('DndDemoController', ngFragmentsDemo.DnDRawController).controller('DndReorderListController', ngFragmentsDemo.DnDReorderListController);
})(ngFragmentsDemo || (ngFragmentsDemo = {}));
//# sourceMappingURL=app.js.map