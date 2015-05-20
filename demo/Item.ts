/**
 * Created by riana on 15/05/15.
 */


module ngFragmentsDemo {

    export function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    export class Item {

        id:string;

        parent:Item;

        kind:string;

        label:string;

        containsChildren:boolean;

        children:Item[] = [];

        isPrototype:boolean = true;

        dragController:any;

        constructor() {

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

                add: function(newItem, index){
                    var item = newItem.createNew();
                    if(index == null) {
                        self.children.push(item);
                    }else {
                        self.children.splice(index, 0, item);
                    }
                },

                remove: function(item){
                    var index =  self.children.indexOf(item);
                    if(index != -1) {
                        self.children.splice(index, 1);
                    }
                    console.log('removing : %o', index );
                }

            }

        }

        public createNew():Item {
            var newItem = new Item();
            newItem.id = ngFragmentsDemo.guid();
            newItem.kind = this.kind;
            newItem.label = this.label;
            newItem.containsChildren = this.containsChildren;
            newItem.isPrototype = false;
            return newItem;
        }

        public remove(index:number) {
            this.children.slice(index, 1);
        }

    }

    export var ItemPrototypes:Item[] = [];

    for (var i = 0; i < 12; i++) {
        var kind:string = 'action';
        var containsChildren = true;
        if (i > 2) {
            containsChildren = false;
            kind = 'check';
        }
        var item:Item = new Item();
        item.kind = kind;
        item.label = "item " + i;
        item.containsChildren = containsChildren;
        ItemPrototypes.push(item);
    }

}