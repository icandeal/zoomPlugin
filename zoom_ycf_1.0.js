/**
 * Created by yuchunfan on 2016/8/12.
 */
var zoom = (function(){

    var TRANSITION_DURATION = 800;
    var MOVE_DURATION = 800;

    var range = 0.5;  //放大增长倍数
    var scale = 1;    //当前放大倍数
    var originX = 0;  //前一个点X
    var originY = 0;  //前一个点Y
    var scaleX = 0;   //当前点X
    var scaleY = 0;   //当前点Y

    var moveX = 0;    //移动中X
    var moveY = 0;    //移动中Y

    var dragStartX = 0;
    var dragStartY = 0;

    var tranX = 0;
    var tranY = 0;

    var scrollX = 0;
    var scrollY = 0;

    var isMove = false;
    var isStart = false;
    var isDrag = false;
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
                move(moveX, moveY);
            }
            if(isStart) {
                moveListener();
            }
        },1000/MOVE_DURATION);
    }

    //esc 退出
    function keyup(event) {
        if( scale !== 1 && event.keyCode === 27 ) {
            zoom.out();
        }
    }

    function touchstart(event){
        isDrag = true;
        dragStartX = event.touches[0].clientX;
        dragStartY = event.touches[0].clientY;
    }
    function touchend(event) {
        if(isMove && isStart) {
            // var scrollOffset = getScrollOffset();
            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;
            tranX = tranX - (dragStartX - endX );
            tranY = tranY - (dragStartY - endY );
            // tranX = tranX - (dragStartX - endX )+ scrollOffset.x;
            // tranY = tranY - (dragStartY - endY )+ scrollOffset.y;
            originX = originX + (dragStartX - endX )/scale;
            originY = originY + (dragStartY - endY)/scale;
        }
        isMove = false;
        isDrag = false;
    }

    function touchmove(event){
        if(isDrag && isStart) {
            isMove = true;
            moveX = dragStartX - event.touches[0].clientX;
            moveY = dragStartY - event.touches[0].clientY;
            // move(moveX, moveY);
        }
    }

    function mouseclick(event){
        if(!isMove){
            scaleX = event.clientX;
            scaleY = event.clientY;
            console.log("("+scaleX+":"+scaleY+")")
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
        dragStartX = event.clientX;
        dragStartY = event.clientY;
    }

    function mouseup(event) {
        console.log("mouseup")

        if(isMove && isStart) {
            // var scrollOffset = getScrollOffset();
            var endX = event.clientX;
            var endY = event.clientY;
            // tranX = tranX - (dragStartX - endX )+ scrollOffset.x;
            // tranY = tranY - (dragStartY - endY )+ scrollOffset.y;
            tranX = tranX - (dragStartX - endX );
            tranY = tranY - (dragStartY - endY );
            // console.log(originX +"+ ("+dragStartX+" -"+ endX +"- "+scrollOffset.x+")/"+scale+"     "+originY +"+ ("+dragStartY+" -"+ endY +"-"+ scrollOffset.y+")/"+scale);
            // console.log("logg222=("+originX+":"+originY+")")
            originX = originX + (dragStartX - endX )/scale;
            originY = originY + (dragStartY - endY)/scale;

            // console.log("loggggg=("+tranX+" : "+tranY+")");
        }
        isDrag = false;
        // isMove = false;
    }

    function mousemove(event){
        console.log("move")
        if(isDrag && isStart) {
            isMove = true;
            moveX = dragStartX - event.clientX;
            moveY = dragStartY - event.clientY;
            // move(moveX, moveY);
        }
    }


    function magnify( ) {

        var scrollOffset = getScrollOffset();

        if( supportsTransforms ) {
            // Reset
            setTransitionDuringTime(TRANSITION_DURATION);
            if( scale === 1 ) {
                document.body.style.transform = '';
                document.body.style.OTransform = '';
                document.body.style.msTransform = '';
                document.body.style.MozTransform = '';
                document.body.style.WebkitTransform = '';
            }
            // Scale
            else {
                var time = (scale - 1)/range;
                var newOriginX = time > 1 ? parseInt((scrollOffset.x+scaleX-windowWidth/2)/(scale-range)+originX): scaleX;
                var newOriginY = time > 1 ? parseInt((scrollOffset.y+scaleY-windowHeight/2)/(scale-range)+originY): scaleY;
                var origin = '0px 0px';
                tranX = -newOriginX*scale+windowWidth/2 +scrollX;
                tranY = -newOriginY*scale+windowHeight/2 +scrollY;
                var transform = 'translate( '+tranX+'px,'+tranY+'px) scale('+ scale +')';
                console.log("("+scrollOffset.x+"+"+scaleX+"-"+windowWidth/2+")/("+scale+"-"+range+")+"+originX);
                console.log("newOrigin  ("+newOriginX+" : "+newOriginY+")");
                console.log("transform = ("+transform+")");
                originX = newOriginX;
                originY = newOriginY;
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
                document.body.style.position = '';
                document.body.style.left = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.height = '';
                document.body.style.zoom = '';
            }
            // Scale
            else {
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
                // var transform = 'translate( '+(tranX-x + dynamicScrollOffset.x)+'px,'+(tranY-y + dynamicScrollOffset.y)+'px) scale('+ scale +')';
                var transform = 'translate( '+(tranX-x)+'px,'+(tranY-y)+'px) scale('+ scale +')';
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
                document.body.style.left = ( - ( originX + x ) / scale ) + 'px';
                document.body.style.top = ( - ( originY + y ) / scale ) + 'px';
                document.body.style.width = ( scale * 100 ) + '%';
                document.body.style.height = ( scale * 100 ) + '%';
                document.body.style.zoom = scale;
            }
        }
    }

    function resetVal() {
        scrollX = 0;
        scrollY = 0;
        originX = 0;
        originY = 0;
        tranX = 0;
        tranY = 0;
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
        x -= scrollX;
        var y =  window.scrollY !== undefined ? window.scrollY: window.pageYOffset;
        y -= scrollY
        return {
            x:x,
            y:y
        }
    }

    function getScrollOffset() {
        var x = window.scrollX !== undefined ? window.scrollX: window.pageXOffset;
        var tmp = scrollX;
        scrollX = x;
        x -= tmp;
        var y =  window.scrollY !== undefined ? window.scrollY: window.pageYOffset;
        tmp = scrollY;
        scrollY = y;
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


            document.addEventListener('mousedown',mousedown);
            document.addEventListener('mouseup',mouseup);
            document.addEventListener('mousemove',mousemove);
            document.addEventListener("click",mouseclick);
            document.addEventListener("touchstart",touchstart);
            document.addEventListener("touchend",touchend);
            document.addEventListener("touchmove",touchmove);
            document.addEventListener( 'keyup',  keyup);
            isStart = true;
            moveListener();

            document.body.style.overflow = 'hidden';
            // window.scrollbars.visible=""

        },

        //退出插件
        out: function(options) {
            resetVal();
            scale = 1;
            magnify();
            isStart = false;
            document.body.style.overflow = '';
            document.removeEventListener("click",mouseclick);
            document.removeEventListener("mousedown",mousedown);
            document.removeEventListener("mousemove",mousemove);
            document.removeEventListener("mouseup",mouseup);
            document.removeEventListener("touchstart",touchstart);
            document.removeEventListener("touchend",touchend);
            document.removeEventListener("touchmove",touchmove);
            document.removeEventListener( 'keyup',  keyup);
            if( options && typeof options.callback === 'function' ) {
                setTimeout( options.callback, TRANSITION_DURATION );
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

