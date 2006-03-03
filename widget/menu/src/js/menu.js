YAHOO.widget.Menu = function(p_oElement, p_oUserConfig) {

	if (arguments.length > 0) {

		YAHOO.widget.Menu.superclass.constructor.call(
            this, 
            p_oElement, 
            p_oUserConfig
        );

	}

}

YAHOO.widget.Menu.prototype = new YAHOO.widget.Overlay();
YAHOO.widget.Menu.prototype.constructor = YAHOO.widget.Menu;
YAHOO.widget.Menu.superclass = YAHOO.widget.Overlay.prototype;


// Public properties

YAHOO.widget.Menu.prototype.index = null;
YAHOO.widget.Menu.prototype.cssClassName = "yuimenu";
YAHOO.widget.Menu.prototype.parent = null;
YAHOO.widget.Menu.prototype.activeMenuItem = null;
YAHOO.widget.Menu.prototype.srcElement = null;
YAHOO.widget.Menu.prototype._Menu = true;


// Public methods

YAHOO.widget.Menu.prototype.init = function(p_oElement, p_oUserConfig) {


    // Private member variables

    var m_aMenuItems = [],
        m_aSubMenus = [],
        m_oListElement,

        m_oEventUtil = YAHOO.util.Event,

        // Create a reference to the MenuManager singleton

        m_oMenuManager = YAHOO.widget.MenuManager, 

        // Create a reference to the Dom singleton

        m_oDom = YAHOO.util.Dom,

        m_sUserAgent = navigator.userAgent.toLowerCase(),

        m_sBrowser = function() {

            var m_sUserAgent = navigator.userAgent.toLowerCase();
            
            if(m_sUserAgent.indexOf('opera') != -1) {

                return 'opera';

            }
            else if(m_sUserAgent.indexOf('msie') != -1) {

                return 'ie';

            }
            else if(m_sUserAgent.indexOf('safari') != -1) {

                return 'safari';

            }
            else if(m_sUserAgent.indexOf('gecko') != -1) {

                return 'gecko';

            }
            else {

                return false;

            }

        }(),


        /*
            Create a reference to the current context so that private methods
            have access to class members
        */ 

        me = this;


    // Private methods

    var addArrayItem = function(p_oArray, p_oItem, p_nIndex) {

        if(typeof p_nIndex == "number") {

            p_oArray.splice(p_nIndex, 0, p_oItem);

            p_oItem.parent = me;


            // Update the index and className properties of each member        
            
            updateArrayItemProperties(p_oArray);

        }
        else {

            var nIndex = p_oArray.length;

            p_oArray[nIndex] = p_oItem;

            p_oItem.index = nIndex;

            p_oItem.parent = me;

            if(nIndex == 0) {

                m_oDom.addClass(p_oItem.element, "first");

            }

        }

    };
    
    var removeArrayItemByIndex = function(p_oArray, p_nIndex) {

        var aArray = p_oArray.splice(p_nIndex, 1);


        // Update the index and className properties of each member        
        
        updateArrayItemProperties(p_oArray);


        // Return a reference to the item that was removed

        return aArray[0];

    };
    
    var removeArrayItemByValue = function(p_oArray, p_oItem) {

        var nIndex = -1,
            i = p_oArray.length-1;

        do {

            if(p_oArray[i] == p_oItem) {

                nIndex = i;
                break;    

            }

        }
        while(i--);

        if(nIndex > -1) {

            return removeArrayItemByIndex(p_oArray, nIndex);

        }      

    };

    var updateArrayItemProperties = function(p_oArray) {

        var i = p_oArray.length-1;


        // Update the index and className properties of each member        

        do {

            p_oArray[i].index = i;

            switch(i) {

                case 0:

                    if(p_oArray[i]._Menu) {

                        p_oArray[i].element.runtimeStyle.behavior = "";

                    }

                    m_oDom.addClass(p_oArray[i].element, "first");

                break;

                default:

                    m_oDom.removeClass(p_oArray[i].element, "first");


                break;

            }

        }
        while(i--);

    };

    var initSubTree = function(p_aNodeList) {
    
        var oNode,
            Menu = YAHOO.widget.Menu,
            MenuItem = YAHOO.widget.MenuItem;
    
        for (var i=0; (oNode = p_aNodeList[i]); i++) {
        
            switch(oNode.tagName) {
    
                case "LI":
                case "OPTGROUP":
                case "OPTION":
                
                    me.addMenuItem((new MenuItem(oNode)));
    
                break;
    
                case "UL":

                    if(
                        oNode.parentNode && 
                        oNode.parentNode.parentNode && 
                        oNode.parentNode.parentNode.tagName == "DIV" && 
                        m_oDom.hasClass(oNode.parentNode.parentNode, "yuimenu")
                    ) {
    
                        var oLI;
    
                        for (var n=0; (oLI = oNode.childNodes[n]); n++) {
    
                            if(oLI.nodeType == 1) {
    
                                me.addMenuItem((new MenuItem(oLI)));
    
                            }
    
                        }
    
                    }
                    else {
    
                        me.addSubMenu((new Menu(oNode)));
    
                    }
    
                break;
    
                case "DIV":
    
                    if(
                        oNode.parentNode &&
                        oNode.parentNode.tagName == "DIV" &&
                        m_oDom.hasClass(oNode.parentNode, "yuimenu") && 
                        m_oDom.hasClass(oNode, "bd") 
                    ) {

                        return initSubTree(oNode.childNodes);

                    }
                    else {                  

                        me.addSubMenu((new Menu(oNode)));
    
                    }

                break;
    
            }
        
        }

    };


    // Private DOM event handlers

    var elementMouseOver = function(p_oEvent, p_oMenu) {

        if(!this.parent || this.parent._MenuItem) {
        
            m_oEventUtil.stopPropagation(p_oEvent);

        }
        

        var oRelatedTarget = m_oEventUtil.getRelatedTarget(p_oEvent),
            oNode = oRelatedTarget,
            bElementMouseOver = true;
    
    
        if(oNode) {
    
            do {
    
                if(oNode == this.element) {
    
                    bElementMouseOver = false;
                    break;
    
                }
    
                oNode = oNode.parentNode;
    
            }
            while(oNode);
    
        }
    
    
        if(bElementMouseOver) {
    
            this.mouseOverEvent.fire(p_oEvent, this);
    
        }
    
    };

    var elementMouseOut = function(p_oEvent, p_oMenu) {

        if(!this.parent || this.parent._MenuItem) {
        
            m_oEventUtil.stopPropagation(p_oEvent);

        }


        var oRelatedTarget = m_oEventUtil.getRelatedTarget(p_oEvent),
            oNode = oRelatedTarget,
            bElementMouseOut = true;
    
    
        if(oNode) {
    
            do {
    
                if(oNode == this.element) {
    
                    bElementMouseOut = false;
                    break;
    
                }
    
                oNode = oNode.parentNode;
    
            }
            while(oNode);
    
        }
    
    
        if(bElementMouseOut) {
    
            this.mouseOutEvent.fire(p_oEvent, this);
    
        }
    
    };

    var elementMouseDown = function(p_oEvent, p_oMenu) {

        if(!this.parent || this.parent._MenuItem) {

            m_oEventUtil.stopPropagation(p_oEvent);

        }

        this.mouseDownEvent.fire(p_oEvent, this);

        return true;

    };
    
    var elementMouseUp = function(p_oEvent, p_oMenu) {

        if(!this.parent || this.parent._MenuItem) {
        
            m_oEventUtil.stopPropagation(p_oEvent);

        }

        this.mouseUpEvent.fire(p_oEvent, this);

        return true;

    };
        
    var elementClick = function(p_oEvent, p_oMenu) {

        var oTarget = m_oEventUtil.getTarget(p_oEvent, true);

        if(
            (!this.parent || this.parent._MenuItem) && 
            oTarget.tagName != "A"
        ) {
        
            m_oEventUtil.stopPropagation(p_oEvent);

        }

        this.clickEvent.fire(p_oEvent, this);

        return true;
    
    };


    // Private CustomEvent handlers

    var menuItemFocus = function(p_sType, p_aArguments, p_oMenu) {
    
        if(this.parent && this.parent._Menu) {

            this.parent.activeMenuItem = p_aArguments[1];
            m_oMenuManager.setActiveMenu(this.parent);
        
        }
        else {

            this.activeMenuItem = p_aArguments[1];
            m_oMenuManager.setActiveMenu(this);

        }    

    };

    var menuItemConfigChange = function(p_sType, p_aArguments, p_oMenu) {

        var sProperty = p_aArguments[0][0];

        switch(sProperty) {

            case "text":
            case "helptext":

                this.cfg.refireEvent("width");

            break;

        }

    };


    // Privileged methods

    this.addMenuItem = function(p_oMenuItem, p_nIndex) {

        if(p_oMenuItem && p_oMenuItem._MenuItem) {

            p_oMenuItem.focusEvent.subscribe(
                menuItemFocus, 
                this,
                true
            );

            p_oMenuItem.cfg.configChangedEvent.subscribe(
                menuItemConfigChange, 
                this, 
                true
            );

            addArrayItem(m_aMenuItems, p_oMenuItem, p_nIndex);

            this.cfg.refireEvent("constraintoviewport");

        }

    };

    this.removeMenuItem = function(p_oObject) {

        if(typeof p_oObject != "undefined") {

            var oMenuItem;

            if(p_oObject._MenuItem) {

                oMenuItem = 
                    removeArrayItemByValue(m_aMenuItems, p_oObject);           

            }
            else if(typeof p_oObject == "number") {

                oMenuItem = 
                    removeArrayItemByIndex(m_aMenuItems, p_oObject);

            }

            if(oMenuItem) {

                oMenuItem.destroy();

            }

        }

    };
        
    this.getMenuItems = function() {

        return m_aMenuItems;

    };

    this.getMenuItem = function(p_nIndex) {

        if(typeof p_nIndex == "number") {

            return m_aMenuItems[p_nIndex];

        }

    };

    this.addSubMenu = function(p_oMenu, p_nIndex) {

        if(
            p_oMenu && 
            p_oMenu._Menu && 
            (
                (!this.parent || (this.parent && this.parent._MenuItem)) &&
                (p_oMenu.getSubMenus().length == 0)
            )
        ) {

            p_oMenu.cfg.setProperty("iframe", false);

            addArrayItem(m_aSubMenus, p_oMenu, p_nIndex);

            this.cfg.refireEvent("constraintoviewport");

        }

    };
        
    this.removeSubMenu = function(p_oObject) {

        if(typeof p_oObject != "undefined") {

            var oMenu;

            if(p_oObject._Menu) {

                oMenu = removeArrayItemByValue(m_aSubMenus, p_oObject);           

            }
            else if(typeof p_oObject == "number") {

                oMenu = removeArrayItemByIndex(m_aSubMenus, p_oObject);

            }

            if(oMenu) {

                oMenu.destroy();

            }

        }

    };
        
    this.getSubMenus = function() {

        return m_aSubMenus;

    };

    this.getSubMenu = function(p_nIndex) {

        if(typeof p_nIndex == "number") {

            return m_aSubMenus[p_nIndex];

        }

    };

    this.renderMenuItems = function() {
    
        if(m_aMenuItems.length > 0) {            
    
            var nMenuItems = m_aMenuItems.length,
                oMenuItem,
                oSubMenu;
    
            for(var i=0; i<nMenuItems; i++) {
    
                oMenuItem = m_aMenuItems[i];
                
                m_oListElement.appendChild(oMenuItem.element);

                oSubMenu = oMenuItem.cfg.getProperty("submenu");

                if(oSubMenu) {

                    oSubMenu.render();

                }
    
            }
    
        }
    
    };
    
    this.renderSubMenus = function() {
    
        if(m_aSubMenus.length > 0) {
    
            var nSubMenus = m_aSubMenus.length;

            for(var i=0; i<nSubMenus; i++) {

                this.appendToBody(m_aSubMenus[i].element);

                m_aSubMenus[i].render();

            }
    
        }
    
    };
    
    this.render = function(p_bAppendToNode, p_bHideSourceElement) {

        m_oDom.addClass(this.element, this.cssClassName);


        /*
            If the menu contains MenuItem instances, create the list element 
            (UL) and append it to the body of the module
        */        

        if(m_aMenuItems.length > 0 && !m_oListElement) {
        
            var oUL = document.createElement("ul");
            this.element.appendChild(oUL);
        
            this.setBody(oUL);

            m_oListElement = oUL;

        }


        /*
            Determine whether to hide or destory the source element
        */ 

        if(this.srcElement) {

            if(p_bHideSourceElement) {
    
                this.srcElement.style.display = "none";
    
            }
            else {
    
                var oParentNode = this.srcElement.parentNode;
                oParentNode.removeChild(this.srcElement);
    
            }

        }

        this.renderMenuItems();

        this.renderSubMenus();


        // Continue with the superclass implementation of this method

        YAHOO.widget.Menu.superclass.render.call(this, p_bAppendToNode);
    
    };

    this.configConstrainToViewport = function(p_sType, p_aArguments, p_oObject) {

        var bConstrainToViewport = p_aArguments[0];

        if(bConstrainToViewport) {

            this.beforeMoveEvent.subscribe(this.enforceConstraints, this, true);

        } else {

            this.beforeMoveEvent.unsubscribe(this.enforceConstraints, this);

        }

        if(m_aMenuItems.length > 0) {

            var i = m_aMenuItems.length - 1,
                oSubMenu;
    
            do {

                oSubMenu = m_aMenuItems[i].cfg.getProperty("submenu");

                if(oSubMenu) {

                    oSubMenu.cfg.setProperty(
                        "constraintoviewport", 
                        bConstrainToViewport
                    );

                }

            }
            while(i--);

        }

        if(m_aSubMenus.length > 0) {

            var i = m_aSubMenus.length - 1;
    
            do {

                m_aSubMenus[i].cfg.setProperty(
                    "constraintoviewport", 
                    bConstrainToViewport
                );

            }
            while(i--);

        }

    };


    this.enforceConstraints = function(type, args, obj) {
    
        var pos = args[0];
        
        var x = pos[0];
        var y = pos[1];
    
        var offsetHeight = this.element.offsetHeight;
        var offsetWidth = this.element.offsetWidth;
    
        var viewPortWidth = YAHOO.util.Dom.getClientWidth();
        var viewPortHeight = YAHOO.util.Dom.getClientHeight();
    
        var scrollX = window.scrollX || document.body.scrollLeft;
        var scrollY = window.scrollY || document.body.scrollTop;
    
        var topConstraint = scrollY;
        var leftConstraint = scrollX;
        var bottomConstraint = scrollY + viewPortHeight - offsetHeight;
        var rightConstraint = scrollX + viewPortWidth - offsetWidth;

        var bSubMenu = (this.parent && this.parent._MenuItem);

        if (x < 10) {

            x = leftConstraint;

        } else if ((x + offsetWidth) > viewPortWidth) {

            if(
                bSubMenu && 
                ((x-this.parent.element.offsetWidth) > offsetWidth)
            ) {
    
                x = (x - (this.parent.element.offsetWidth + offsetWidth));
    
            }
            else {

                x = rightConstraint;

            }

        }

        if (y < 10) {

            y = topConstraint;

        } else if (y > bottomConstraint) {

            if(bSubMenu && (y > offsetHeight)) {

                y = ((y + this.parent.element.offsetHeight) - offsetHeight);

            }
            else {

                y = bottomConstraint;

            }

        }
 
        this.cfg.setProperty("x", x, true);
        this.cfg.setProperty("y", y, true);
    
    };


    this.configWidth = function(p_sType, p_aArguments, p_oObject) {

        var sWidth = p_aArguments[0];

        if(this.parent) {

            var oMenuElementClone = this.element.cloneNode(true);

            m_oDom.setStyle(oMenuElementClone, "auto");

            document.body.appendChild(oMenuElementClone);

            var sWidth = m_oDom.getStyle(oMenuElementClone, "width");

            document.body.removeChild(oMenuElementClone);

            p_aArguments[0] = sWidth;

        }
        else {

            p_aArguments[0] = "auto";

        }
   

        // Continue with the superclass implementation of this method

        YAHOO.widget.Menu.superclass.configWidth.call(
            this, 
            p_sType, 
            p_aArguments, 
            p_oObject
        );

    };

    this.configVisible = function(p_sType, p_aArguments, p_oObject) {
   
        var bVisible = p_aArguments[0];

        if (bVisible) {

            this.cfg.refireEvent("width");


            // Continue with the superclass implementation of this method
    
            YAHOO.widget.Menu.superclass.configVisible.call(
                this, 
                p_sType, 
                p_aArguments, 
                p_oObject
            );

    
        } else {
    
            // Continue with the superclass implementation of this method
    
            YAHOO.widget.Menu.superclass.configVisible.call(
                this, 
                p_sType, 
                p_aArguments, 
                p_oObject
            );

    
            var oActiveMenuItem;
        
            if(this.parent && this.parent._Menu) {
        
                oActiveMenuItem = this.parent.activeMenuItem;
            
            }
            else {
            
                oActiveMenuItem = this.activeMenuItem;
            
            }
            
            if(oActiveMenuItem) {
        
                if(oActiveMenuItem.cfg.getProperty("selected")) {
        
                    oActiveMenuItem.cfg.setProperty("selected", false)
        
                }
        
                var oSubMenu = oActiveMenuItem.cfg.getProperty("submenu");
        
                if(oSubMenu && oSubMenu.cfg.getProperty("visible")) {
        
                    oSubMenu.hide();
        
                }
        
            }
    
        }
    
    };


    // Begin constructor logic

    var oElement;


    if(typeof p_oElement == "string") {

        oElement = document.getElementById(p_oElement);

    }
    else if(p_oElement.tagName) {

        oElement = p_oElement;

    }


    if(oElement) {

        switch(oElement.tagName) {
    
            case "DIV":

                if(m_oDom.hasClass(oElement, "yuimenu")) {

                    this.srcElement = oElement;
   
                    if(!oElement.id) {

                        oElement.id = m_oMenuManager.createMenuId();

                    }
 
    
                    /* 
                        Note that we don't pass the user config in here yet 
                        because we only want it executed once, at the lowest 
                        subclass level
                    */ 
                
                    YAHOO.widget.Menu.superclass.init.call(this, oElement.id); 
    
    
                    // Get the list node (UL) if it exists
    
                    if(
                        this.element.firstChild && 
                        this.element.firstChild.nodeType == 1 && 
                        this.element.firstChild.tagName == "UL"
                    ) {
    
                        m_oListElement = this.element.firstChild;
    
                    }
                    else if(
                        this.element.childNodes[1] && 
                        this.element.childNodes[1].nodeType == 1 &&
                        this.element.childNodes[1].tagName == "UL"
                    ) {
    
                        m_oListElement = this.element.childNodes[1];
    
                    }
    
                }
    
            break;
    
            case "UL":
            case "SELECT":
    
                this.srcElement = oElement;
    
    
                /*
                    The source element is not something that we can use 
                    outright, so we need to create a new Overlay
                */
    
                var sId = m_oMenuManager.createMenuId();
    
    
                /* 
                    Note that we don't pass the user config in here yet 
                    because we only want it executed once, at the lowest 
                    subclass level
                */ 
            
                YAHOO.widget.Menu.superclass.init.call(this, sId); 
    
            break;
    
        }

    }
    else {

        /* 
            Note that we don't pass the user config in here yet 
            because we only want it executed once, at the lowest 
            subclass level
        */ 
    
        YAHOO.widget.Menu.superclass.init.call(this, p_oElement);

    }

    if(this.element) {

        var CustomEvent = YAHOO.util.CustomEvent;


        // Assign DOM event handlers

        m_oEventUtil.addListener(
            this.element, 
            "mouseover", 
            elementMouseOver, 
            this,
            true
        );

        m_oEventUtil.addListener(
            this.element, 
            "mouseout", 
            elementMouseOut, 
            this,
            true
        );

        m_oEventUtil.addListener(
            this.element, 
            "mousedown", 
            elementMouseDown, 
            this,
            true
        );

        m_oEventUtil.addListener(
            this.element, 
            "mouseup", 
            elementMouseUp, 
            this,
            true
        );

        m_oEventUtil.addListener(
            this.element, 
            "click", 
            elementClick, 
            this,
            true
        );


        // Create custom events

        this.mouseOverEvent = new CustomEvent("mouseOverEvent", this);
        this.mouseOutEvent = new CustomEvent("mouseOutEvent", this);
        this.mouseDownEvent = new CustomEvent("mouseDownEvent", this);
        this.mouseUpEvent = new CustomEvent("mouseUpEvent", this);
        this.clickEvent = new CustomEvent("clickEvent", this);

        m_oMenuManager.addMenu(this);


        if(p_oUserConfig) {
    
            this.cfg.applyConfig(p_oUserConfig);
    
        }

        if(this.srcElement) {

            initSubTree(this.srcElement.childNodes);

        }

    }

};