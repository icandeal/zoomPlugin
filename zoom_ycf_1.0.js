/**
 * Created by yuchunfan on 2016/8/12.
 */
var zoom = (function(){

    //可设置参数
    var TRANSITION_DURATION = 800;
    var MOVE_DURATION = 800;

    var stretchRange = 100;
    var range = 0.5;    //放大增长倍数

    var callback = null;
    var startFaction = null;

    //可设置参数结束


    var scale = 1;      //当前放大倍数

    var prePoint = { x:0, y:0 };    //前一个点坐标
    var currPoint = { x:0, y:0 };   //当前点坐标
    var movePoint = { x:0, y:0 };   //移动中点坐标
    var dragStart = { x:0, y:0 };   //拖动开始点坐标
    var transOffset = { x:0, y:0 }; //偏移量
    var scroll = { x:0, y:0 };      //滚动条距离

    var touchPoint = [{ x:0, y:0 }, { x:0, y:0 }];

    var isStart = false;
    var isMove = false;     //是否移动
    var isDrag = false;     //是否是拖动
    var isStretch = false;  //是否拉伸

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var supportsTransforms = 	'WebkitTransform' in document.body.style ||
        'MozTransform' in document.body.style ||
        'msTransform' in document.body.style ||
        'OTransform' in document.body.style ||
        'transform' in document.body.style;

    if( supportsTransforms ) {
        // The easing that will be applied when we zoom in/out
        document.body.style.transition = 'transform '+ TRANSITION_DURATION +'ms ease';
        document.body.style.OTransition = '-o-transform '+ TRANSITION_DURATION +'ms ease';
        document.body.style.msTransition = '-ms-transform '+ TRANSITION_DURATION +'ms ease';
        document.body.style.MozTransition = '-moz-transform '+ TRANSITION_DURATION +'ms ease';
        document.body.style.WebkitTransition = '-webkit-transform '+ TRANSITION_DURATION +'ms ease';
    }

    function moveListener() {
        setTimeout(function () {
            if(isMove) {
                move(movePoint.x, movePoint.y);
            }
            if(isStart) {
                moveListener();
            }
        },1000/MOVE_DURATION);
    }

    //esc 退出
    function keyup(event) {
        if( scale !== 1 && event.keyCode === 27 ) {
            zoom.reset();
        }
    }

    function touchstart(event){
        if(event.touches.length == 1) {
            isDrag = true;
            dragStart.x = event.touches[0].clientX;
            dragStart.y = event.touches[0].clientY;
        }
        else if(event.touches.length == 2) {
            if(!isMove) {
                isStretch = true;
                isDrag = false;
                touchPoint[0].x = parseInt(event.touches[0].clientX);
                touchPoint[0].y = parseInt(event.touches[0].clientY);
                touchPoint[1].x = parseInt(event.touches[1].clientX);
                touchPoint[1].y = parseInt(event.touches[1].clientY);
                currPoint.x = (touchPoint[0].x+touchPoint[1].x)/2;
                currPoint.y = (touchPoint[0].y+touchPoint[1].y)/2;
            }

        }
        else if(event.touches.length == 3) {
            zoom.reset();
        }
    }

    function touchmove(event){
        if(isDrag && isStart ) {
            isMove = true;
            movePoint.x = dragStart.x - event.touches[0].clientX;
            movePoint.y = dragStart.y - event.touches[0].clientY;
            // move(movePoint.x, movePoint.y);
        }
        else if( isStretch && isStart ) {
            var stretchLen = Math.pow(parseInt(event.touches[0].clientX - event.touches[1].clientX),2 )+
                    Math.pow(parseInt(event.touches[0].clientY - event.touches[1].clientY),2)
                -  (Math.pow(parseInt(touchPoint[0].x-touchPoint[1].x),2)
                    + Math.pow(parseInt(touchPoint[0].y-touchPoint[1].y),2));
            scale += stretchLen>0? range:-range;
            isStretch = false;
            magnify();

        }
    }

    function touchend(event) {
        if(isMove && isStart) {
            // var scrollOffset = getScrollOffset();
            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;
            transOffset.x = transOffset.x - (dragStart.x - endX );
            transOffset.y = transOffset.y - (dragStart.y - endY );
            // transOffset.x = transOffset.x - (dragStart.x - endX )+ scrollOffset.x;
            // transOffset.y = transOffset.y - (dragStart.y - endY )+ scrollOffset.y;
            prePoint.x = prePoint.x + (dragStart.x - endX ) / scale;
            prePoint.y = prePoint.y + (dragStart.y - endY) / scale;
            isMove = false;
            isDrag = false;
        }
        else if (isStretch){
            isStretch = false;
        }
    }

    function mouseclick(event){
        if(!isMove){
            currPoint.x = event.clientX;
            currPoint.y = event.clientY;
            console.log("click ==========("+currPoint.x+":"+currPoint.y+")")
            if (isStart) {
                scale += range;
                magnify();
            }
        }
        else {
            isMove = false;
        }
    }

    function mousedown(event) {
        console.log("mousedown")
        isDrag = true;
        dragStart.x = event.clientX;
        dragStart.y = event.clientY;
    }

    function mouseup(event) {
        console.log("mouseup")

        if(isMove && isStart) {
            // var scrollOffset = getScrollOffset();
            var endX = event.clientX;
            var endY = event.clientY;
            // transOffset.x = transOffset.x - (dragStart.x - endX )+ scrollOffset.x;
            // transOffset.y = transOffset.y - (dragStart.y - endY )+ scrollOffset.y;
            transOffset.x = transOffset.x - (dragStart.x - endX );
            transOffset.y = transOffset.y - (dragStart.y - endY );
            // console.log(prePoint.x +"+ ("+dragStart.x+" -"+ endX +"- "+scrollOffset.x+")/"+scale+"     "+prePoint.y +"+ ("+dragStart.y+" -"+ endY +"-"+ scrollOffset.y+")/"+scale);
            // console.log("logg222=("+prePoint.x+":"+prePoint.y+")")
            prePoint.x = prePoint.x + (dragStart.x - endX )/scale;
            prePoint.y = prePoint.y + (dragStart.y - endY)/scale;

            // console.log("loggggg=("+transOffset.x+" : "+transOffset.y+")");
        }
        isDrag = false;
        isMove = false;
    }

    function mousemove(event){
        if(isDrag && isStart) {
            isMove = true;
            movePoint.x = dragStart.x - event.clientX;
            movePoint.y = dragStart.y - event.clientY;
            // move(movePoint.x, movePoint.y);
        }
    }


    function magnify( ) {
        if(scale<1) {
            scale+=range;
            return;
        }
        var scrollOffset = getScrollOffset();

        if( supportsTransforms ) {
            // Reset
            setTransitionDuringTime(TRANSITION_DURATION);
            if( scale === 1 ) {
                if(callback !=null && typeof callback == 'function')
                    callback();
                document.body.style.transform = '';
                document.body.style.OTransform = '';
                document.body.style.msTransform = '';
                document.body.style.MozTransform = '';
                document.body.style.WebkitTransform = '';
            }
            // Scale
            else {
                if(startFaction !=null && typeof startFaction == 'function')
                    startFaction();
                var time = (scale - 1)/range;
                var newOriginX = time > 1 ? parseInt((scrollOffset.x+currPoint.x-windowWidth/2)/(scale-range)+prePoint.x): currPoint.x;
                var newOriginY = time > 1 ? parseInt((scrollOffset.y+currPoint.y-windowHeight/2)/(scale-range)+prePoint.y): currPoint.y;
                var origin = '0px 0px';
                transOffset.x = -newOriginX*scale+windowWidth/2 +scroll.x;
                transOffset.y = -newOriginY*scale+windowHeight/2 +scroll.y;
                var transform = 'translate( '+transOffset.x+'px,'+transOffset.y+'px) scale('+ scale +')';
                console.log("("+scrollOffset.x+"+"+currPoint.x+"-"+windowWidth/2+")/("+scale+"-"+range+")+"+prePoint.x);
                console.log("newOrigin  ("+newOriginX+" : "+newOriginY+")");
                console.log("transform = ("+transform+")");
                prePoint.x = newOriginX;
                prePoint.y = newOriginY;
                document.body.style.transformOrigin = origin;
                document.body.style.OTransformOrigin = origin;
                document.body.style.msTransformOrigin = origin;
                document.body.style.MozTransformOrigin = origin;
                document.body.style.WebkitTransformOrigin = origin;
                document.body.style.transform = transform;
                document.body.style.OTransform = transform;
                document.body.style.msTransform = transform;
                document.body.style.MozTransform = transform;
                document.body.style.WebkitTransform = transform;
            }
        }
        else {
            // Reset
            if( scale === 1 ) {
                if(callback !=null && typeof callback == 'function')
                    callback();
                document.body.style.position = '';
                document.body.style.left = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.height = '';
                document.body.style.zoom = '';
            }
            // Scale
            else {
                if(startFaction !=null && typeof startFaction == 'function')
                    startFaction();
                document.body.style.position = 'relative';
                document.body.style.left = ( - ( scrollOffset.x + rect.x ) / scale ) + 'px';
                document.body.style.top = ( - ( scrollOffset.y + rect.y ) / scale ) + 'px';
                document.body.style.width = ( scale * 100 ) + '%';
                document.body.style.height = ( scale * 100 ) + '%';
                document.body.style.zoom = scale;
            }
        }
    }

    function move(x,y) {
        // var dynamicScrollOffset = getDynamicScrollOffset();

        if( supportsTransforms ) {
            setTransitionDuringTime(0);
            if( scale === 1 ) {
                document.body.style.transform = '';
                document.body.style.OTransform = '';
                document.body.style.msTransform = '';
                document.body.style.MozTransform = '';
                document.body.style.WebkitTransform = '';
            }
            else {
                // var transform = 'translate( '+(transOffset.x-x + dynamicScrollOffset.x)+'px,'+(transOffset.y-y + dynamicScrollOffset.y)+'px) scale('+ scale +')';
                var transform = 'translate( '+(transOffset.x-x)+'px,'+(transOffset.y-y)+'px) scale('+ scale +')';
                console.log("move ==" +transform);
                document.body.style.transform = transform;
                document.body.style.OTransform = transform;
                document.body.style.msTransform = transform;
                document.body.style.MozTransform = transform;
                document.body.style.WebkitTransform = transform;
            }
        }
        else {
            if( scale === 1 ) {
                document.body.style.position = '';
                document.body.style.left = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.height = '';
                document.body.style.zoom = '';
            }
            else {
                document.body.style.position = 'relative';
                document.body.style.left = ( - ( prePoint.x + x ) / scale ) + 'px';
                document.body.style.top = ( - ( prePoint.y + y ) / scale ) + 'px';
                document.body.style.width = ( scale * 100 ) + '%';
                document.body.style.height = ( scale * 100 ) + '%';
                document.body.style.zoom = scale;
            }
        }
    }

    function resetVal() {
        scroll.x = 0;
        scroll.y = 0;
        prePoint.x = 0;
        prePoint.y = 0;
        transOffset.x = 0;
        transOffset.y = 0;
    }

    function setTransitionDuringTime(time) {
        document.body.style.transition = 'transform '+time+'ms ease';
        document.body.style.OTransition = '-o-transform '+time+'ms ease';
        document.body.style.msTransition = '-ms-transform '+time+'ms ease';
        document.body.style.MozTransition = '-moz-transform '+time+'ms ease';
        document.body.style.WebkitTransition = '-webkit-transform '+time+'ms ease';
    }

    function getDynamicScrollOffset() {
        var x = window.scrollX !== undefined ? window.scrollX: window.pageXOffset;
        x -= scroll.x;
        var y =  window.scrollY !== undefined ? window.scrollY: window.pageYOffset;
        y -= scroll.y
        return {
            x:x,
            y:y
        }
    }

    function getScrollOffset() {
        var x = window.scrollX !== undefined ? window.scrollX: window.pageXOffset;
        var tmp = scroll.x;
        scroll.x = x;
        x -= tmp;
        var y =  window.scrollY !== undefined ? window.scrollY: window.pageYOffset;
        tmp = scroll.y;
        scroll.y = y;
        y -= tmp;
        return {
            x:x,
            y:y
        }
    }

    return {
        //开始插件
        start: function( options ) {
            if(typeof options == "undefined"){
                options = {};
            }

            MOVE_DURATION = options.mduring ||MOVE_DURATION;
            TRANSITION_DURATION = options.tduring ||TRANSITION_DURATION;
            range = options.range || 0.5;
            stretchRange = options.stretchRange || stretchRange;
            if(typeof options.startFunction!='undefined' && typeof options.startFunction == "function") {
                startFaction = options.startFunction;
            }

            if(typeof options.callback!='undefined' && typeof options.callback == "function") {
                callback = options.callback;
            }


            document.addEventListener('mousedown',mousedown);
            document.addEventListener('mouseup',mouseup);
            document.addEventListener('mousemove',mousemove);
            document.addEventListener("dblclick",mouseclick);
            document.addEventListener("touchstart",touchstart);
            document.addEventListener("touchend",touchend);
            document.addEventListener("touchmove",touchmove);
            document.addEventListener( 'keyup',  keyup);
            isStart = true;
            moveListener();

            // document.body.style.overflow = 'hidden';
            // window.scrollbars.visible=""

        },

        //退出插件
        out: function() {
            resetVal();
            scale = 1;
            magnify();
            isStart = false;
            // document.body.style.overflow = '';
            document.removeEventListener("dblclick",mouseclick);
            document.removeEventListener("mousedown",mousedown);
            document.removeEventListener("mousemove",mousemove);
            document.removeEventListener("mouseup",mouseup);
            document.removeEventListener("touchstart",touchstart);
            document.removeEventListener("touchend",touchend);
            document.removeEventListener("touchmove",touchmove);
            document.removeEventListener( 'keyup',  keyup);
            if( callback && typeof callback === 'function' ) {
                setTimeout( callback, TRANSITION_DURATION );
            }
        },

        //重置但是不退出
        reset: function() {
            resetVal();
            scale = 1;
            magnify();
        },

        //获得当前放大倍数
        zoomScale: function() {
            return scale;
        }
    }

})();

