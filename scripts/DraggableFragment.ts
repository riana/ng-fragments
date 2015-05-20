/**
 * Created by riana on 15/05/15.
 */


/// <reference path='../typings/_all.ts' />

module ngFragments {

    'use strict';

    var dnd = angular.module('ngFragmentsDnd', [])
            .directive('draggableFragment', ['$document', '$window', '$parse', DraggableFragmentDirective])
        ;


    export class DnDHelper {


        public static getElementIndex(element):number {
            var angParent = element.parent();

            var siblings:any = angParent.children();

            var index = -1;
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i] === element[0]) {
                    index = i;
                }
            }
            return index;
        }


        public static getDnDList(itemEl):any {
            var lm = itemEl.attr('dnd-list');
            if (lm) {
                var scope = itemEl.scope();
                if (scope)
                    return scope.$eval(lm);
            }
            return null;
        }


        public static getDnDHandler(itemEl):any {
            var lm = itemEl.attr('dnd-handler');
            if (lm) {
                var scope = itemEl.scope();
                if (scope)
                    return scope.$eval(lm);
            }
            return null;
        }

        public static pointerPosition(e) {
            var obj;
            if (e.targetTouches !== undefined) {
                obj = e.targetTouches.item(0);
            } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                obj = e.originalEvent.targetTouches.item(0);
            } else {
                obj = e;
            }
            return obj;
        }

        public static hasAttribute(el, name) {
            return el[0] && el[0].attributes && el[0].attributes[name] != null;
        }

        public static getDraggableAncestor(el) {
            if ((DnDHelper.hasAttribute(el, 'draggable-fragment') || el.attr('dnd-handler') || el.attr('dnd-list')) && !el.hasClass('drag-ghost')) {
                return el;
            } else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDraggableAncestor(parent);
                } else {
                    return null;
                }
            }
            return null;
        }

        public static getDraggablElement(el) {

            //If a drop-zope is found during draggable parent - break searh an treat as a container
            if (el.attr('dnd-handler') || el.attr('dnd-list')) {
                return null;
            }

            if (DnDHelper.hasAttribute(el, 'draggable-fragment') && !el.hasClass('drag-ghost')) {
                return el;
            } else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDraggablElement(parent);
                } else {
                    return null;
                }
            }
            return null;
        }

        public static getDragContainer(el) {
            if (el.attr('dnd-handler') || el.attr('dnd-list')) {
                return el;
            } else {
                var parent = el.parent();
                if (parent.length != 0) {
                    return DnDHelper.getDragContainer(parent);
                } else {
                    return null;
                }
            }
            return null;
        }
    }

    enum InsertPosition {
        Before,
        After
    }

    enum DropTargetType {
        Item,
        Container,
        None
    }

    export class DropTarget {
        targetElement:any;

        targetContainer:any;

        targetIndex:number;

        targetDnDModel:any;

        targetDnDList:any;

        insertPosition:InsertPosition;

        type:DropTargetType;

        public resetType() {
            this.type = DropTargetType.None;
        }

        public setElement(targetItem, insertIndex, insertPosition) {
            this.targetElement = targetItem;
            this.targetIndex = insertIndex;
            this.insertPosition = insertPosition;
            this.type = DropTargetType.Item;
            //if(this.targetContainer[0] == this.targetElement[0]){
            //    this.type = DropTargetType.Container;
            //}
        }

        public setContainer(targetContainer) {
            this.targetElement = null;
            this.targetIndex = null;
            this.insertPosition = null;
            this.targetContainer = targetContainer;
            this.targetDnDModel = DnDHelper.getDnDHandler(targetContainer);
            this.targetDnDList = DnDHelper.getDnDList(targetContainer);
            this.type = DropTargetType.Container;
        }

        public getTargetScope():ng.IScope {
            if (this.targetElement) {
                return this.targetElement.scope();
            } else if (this.targetContainer) {
                return this.targetContainer.scope();
            }
        }

        public isDifferent(droptarget:DropTarget):boolean {
            return true;
        }

        public isElement() {
            return this.type == DropTargetType.Item;
        }

        public isContainer() {
            return this.type == DropTargetType.Container;
        }

        public isEmpty() {
            return this.type == DropTargetType.None;
        }

        public update(droptarget:DropTarget) {
            this.targetElement = droptarget.targetElement;
            this.targetIndex = droptarget.targetIndex;
            this.insertPosition = droptarget.insertPosition;
            this.targetContainer = droptarget.targetContainer;
            this.targetDnDModel = droptarget.targetDnDModel;
            this.targetDnDList = droptarget.targetDnDList;
        }

        public accept(dragContext:DragContext, targetIndex:number) {
            if (this.targetDnDModel) {
                return this.targetDnDModel.accept(dragContext.sourceObject, targetIndex);
            } else {
                return true;
            }
        }

    }

    export class DropContext {

        dropTarget:DropTarget;

        dropGhost:any;

        dragContext:DragContext;

        inSameContainer:boolean;


        constructor(dragContext:DragContext) {
            this.dragContext = dragContext;
            this.dropTarget = new DropTarget();
        }

        public updateContext(event:any, dropTarget:DropTarget) {

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
                        } else if (dropTarget.isElement()) {
                            var containerElement = dropTarget.targetElement.parent();
                            var children = containerElement.children();
                            var insertIndex = dropTarget.targetIndex;
                            if (dropTarget.insertPosition == InsertPosition.Before) {
                                insertIndex = dropTarget.targetIndex - 1;
                            }
                            if (insertIndex == -1) {
                                containerElement[0].insertBefore(this.dropGhost[0], children[0]);
                            } else {
                                angular.element(children[insertIndex]).after(this.dropGhost);
                            }
                        }
                    }
                }
                this.dropTarget.update(dropTarget);
            }

        }

        public performDrop(dragContext:DragContext) {
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
                            if (targetPosition == InsertPosition.After && !self.inSameContainer) {
                                insertIndex = targetIndex + 1;
                            }


                            if (targetDnDModel) {
                                targetDnDModel.add(dragContext.sourceObject, insertIndex);
                            } else if (targetDnDList) {

                                if (insertIndex == null) {
                                    targetDnDList.push(dragContext.sourceObject);
                                } else {
                                    targetDnDList.splice(insertIndex, 0, dragContext.sourceObject);
                                }
                            }
                        });
                    }

                }
            }
        }

        public createDropGhost() {
            var ghost = this.dragContext.sourceElement.clone(true);
            ghost.addClass('drop-ghost');
            ghost.removeAttr('ng-repeat');
            ghost.removeAttr('draggable-fragment');
            ghost.removeClass('ng-pristine ng-untouched ng-valid ng-scope');
            return ghost;
        }

        public removeDropGhost() {
            if (this.dropGhost) {
                this.dropGhost.remove();
                this.dropGhost = null;
            }
        }

        public dispose() {
            this.removeDropGhost();
        }

    }

    export class DragContext {

        dragGhost:any;

        sourceScope:ng.IScope;

        sourceDnDModel:any;

        sourceDnDList:any;

        sourceObject:any;

        sourceContainer:any;

        sourceElement:any;

        sourceIndex:number;

        constructor(sourceElement:any) {
            this.sourceElement = sourceElement;
            this.sourceContainer = this.sourceElement.parent();
            this.sourceScope = this.sourceElement.scope();
            this.sourceIndex = DnDHelper.getElementIndex(this.sourceElement);
            this.sourceDnDModel = DnDHelper.getDnDHandler(this.sourceContainer);
            this.sourceDnDList = DnDHelper.getDnDList(this.sourceContainer);
            if (this.sourceDnDModel) {
                this.sourceObject = this.sourceDnDModel.itemAt(this.sourceIndex);
            } else if (this.sourceDnDList) {
                this.sourceObject = this.sourceDnDList[this.sourceIndex];
            }
        }

        public init(e:any) {
            this.createDragGhost();
            this.updateDragGhostLocation(e);

        }

        public createDragGhost() {
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
                top: '' + (rect.top ) + 'px',
                left: '' + (rect.left ) + 'px',
                //opacity: 0.5
            });
        }

        public updateDragGhostLocation(e:any) {
            var pos = DnDHelper.pointerPosition(e);
            //console.log(e);

            var winX = pos.clientX + document.body.scrollLeft;
            var winY = pos.clientY + document.body.scrollTop;
            this.dragGhost.css({
                top: '' + (winY + 10) + 'px',
                left: '' + (winX + 10) + 'px',
            });
        }


        public dropPerformed() {
            var self = this;
            if (this.sourceDnDModel) {
                if (this.sourceDnDModel.pull) {
                    this.sourceScope.$apply(function () {
                        self.sourceDnDModel.remove(self.sourceObject);
                    });
                }
            }else if(this.sourceDnDList){
                var index =  self.sourceDnDList.indexOf(self.sourceObject);
                if(index != -1) {
                    self.sourceDnDList.splice(index, 1);
                }
            }
        }

        public dispose() {
            this.dragGhost.remove();
            this.sourceElement.css({
                opacity: 1
            });
        }

    }

    export interface DraggableFragmentScope extends ng.IScope {
        //scope attributes
    }


    export function DraggableFragmentDirective($document, $window, $parse):ng.IDirective {

        return {
            restrict: 'A',
            link: ($scope:DraggableFragmentScope, element:any, attributes:ng.IAttributes) => {

                var dragContext:DragContext;

                var dropContext:DropContext;

                var dragHandle = element;
                var handles = element[0].getElementsByClassName('drag-handle');
                if (handles.length > 0) {
                    dragHandle = angular.element(handles[0]);
                }


                dragHandle.bind('touchstart mousedown', function (e) {
                    dragContext = new DragContext(element);
                    dropContext = new DropContext(dragContext);
                    dragStart(e)
                });

                function dragStart(e:any) {
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

                function dragEnd(e:any) {
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

                function dragCancel(e:any) {
                    dragContext.dispose();
                    dropContext.dispose();
                    //console.log('Drag Cancel');
                }

                function clearSelectionOnDrag() {

                }

                // TODO Vieux hack filtre de seuil position
                var lastX = 0;
                var lastY = 0;

                function dragMove(e:any) {
                    //console.log('Drag Move');
                    //console.log(e);
                    e.preventDefault();

                    //Clear selection on drag
                    if ($window.getSelection) {
                        $window.getSelection().removeAllRanges();
                    } else if ($window.document.selection) {
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
                    } else {
                        return;
                    }
                    //END vieux hack

                    var dropTarget:DropTarget = new DropTarget();

                    var hoverElement = angular.element($window.document.elementFromPoint(winX, winY));
                    //console.log("Hover %o", $window.document.elementFromPoint(winX, winY));

                    dropTarget.resetType();

                    var targetContainer = DnDHelper.getDragContainer(hoverElement);
                    if (targetContainer) {
                        dropTarget.setContainer(targetContainer);
                        //console.log("over container");
                    }

                    var targetItem = DnDHelper.getDraggablElement(hoverElement);
                    if (targetItem) {
                        var targetItemBounds = targetItem[0].getBoundingClientRect();
                        var dy = winY - targetItemBounds.top;
                        var insertIndex:number = DnDHelper.getElementIndex(targetItem);
                        var insertPosition:InsertPosition = InsertPosition.After;
                        if (dy < targetItemBounds.height / 2) {
                            insertPosition = InsertPosition.Before;
                        }
                        dropTarget.setElement(targetItem, insertIndex, insertPosition);
                    }

                    dropContext.updateContext(e, dropTarget);

                }


                function getDraggableIndex(el):number {
                    var angParent = el.parent();

                    var siblings:any = angParent.children();

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
                    } else {
                        var parent = el.parent();
                        if (parent.length != 0) {
                            return isDropGhost(parent);
                        } else {
                            return false;
                        }
                    }
                    return false;
                }


            }
        }
    }
}