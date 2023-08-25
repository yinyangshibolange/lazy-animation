(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    function eachDom (doms, func) {
        for (let k = 0; k < doms.length; k++) {
            if (typeof func === 'function') {
                func(doms[k], k);
            }
        }
    }
    function domAddClass (dom, classString) {
        classString.split(/\s+/).forEach(function (cls) {
            var _trim_cls = cls.trim();
            if (!dom.classList.contains(_trim_cls)) {
                dom.classList.add(_trim_cls);
            }
        });
    }
    var imagesLoadedCallbacks = [], loadedImageCount = 0;
    function triggerImagesLoaded (callback, imageSelector = "img") {
        var imageDoms = document.querySelectorAll(imageSelector), hasSrcImageLength = 0;
        imagesLoadedCallbacks.push(callback);
        function callFunctions () {
            if (Array.isArray(imagesLoadedCallbacks) && imagesLoadedCallbacks.length > 0) {
                for (var k = 0; k < imagesLoadedCallbacks.length; k++) {
                    if (typeof imagesLoadedCallbacks[k] === 'function') {
                        imagesLoadedCallbacks[k]();
                    }
                }
                // imagesLoadedCallbacks = []
            }
        }
        function updateHasSrcImageLength() {
            hasSrcImageLength= 0;
            eachDom(imageDoms, function (dom) {
                if(dom.getAttribute("src")) {
                    hasSrcImageLength += 1;
                }
            });
        }
        if (imagesLoadedCallbacks.length === 1) {
            updateHasSrcImageLength();
            eachDom(imageDoms, function (dom) {
                if (dom.height > 0) { // 如果缓存了图片，那么load事件不会触发
                    loadedImageCount += 1;
                } else {
                    dom.addEventListener("load", function (ev) {
                        updateHasSrcImageLength();
                        loadedImageCount += 1;
                        if (loadedImageCount >= hasSrcImageLength) {
                            callFunctions();
                        }
                    });
                    
                }
            });
            setTimeout(function() {
                if (loadedImageCount >= hasSrcImageLength) {
                    callFunctions();
                }
            }, 100);
        }

    }

    /**
     * 
     * @param {*} selector 需要执行动画的选择器，默认.lazy-ani
     * @param {*} autoImageSelector 由于文档流中图片加载可能会撑高文档流，导致定位不准，所以需要监听这些可能会撑高文档流的图片的加载事件，完成之后才计算动画
     */
    window.lazyAni = function (selector = ".lazy-ani", autoImageSelector = "img") {
        // 创建style标签
        var style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(style);

        function getKeyFrames (animationName, list) {
            return `
                @keyframes ${animationName} {
                    ${list.map(item => item.key + '{' + item.value + '}').join('\n')}
                }
                `
        }

        var windowHeight = document.documentElement.clientHeight || window.innerHeight;
        function aniShowFunc (ev) {
            var lazyAniDoms = document.querySelectorAll(selector);
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;

            eachDom(lazyAniDoms, function (dom) {
                var dataset = dom.dataset;
                var aniTrigger = dataset.aniTrigger || 'bottom';
                var animation = dataset.animation;
                var aniClass = dataset.aniClass;

                if(typeof dataset.top === 'undefined' || typeof dataset.bottom === 'undefined' || typeof dataset.height === 'undefined') return
                function triggerAnimation (_dom) {
                    if (aniClass) {
                        domAddClass(_dom, aniClass);
                        _dom.style.visibility = 'visible';
                    } else {
                        _dom.style.animation = animation;
                        _dom.style.visibility = 'visible';
                    }
                }
                function tranTriggerStr2Distance (str, height,) {
                    if (str.endsWith("%")) {
                        return parseFloat(str.replace("%", "")) / 100 * height
                    } else {
                        return parseFloat(str)
                    }
                }
                if (aniTrigger === 'top') {
                    if (scrollTop + windowHeight > parseFloat(dataset.top)) { // 滚动过元素的top
                        triggerAnimation(dom);
                    }
                } else if (aniTrigger === 'bottom') {
                    if (scrollTop + windowHeight > parseFloat(dataset.bottom)) { // 滚动过元素的top
                        triggerAnimation(dom);
                    }
                } else if (/top[+-]\d+%?/.test(aniTrigger)) {
                    var _m_top = aniTrigger.match(/top([+-])(\d+%?)/);
                    var trigger_distance = parseFloat(dataset.top);
                    if (_m_top[1] === '+') {
                        trigger_distance = trigger_distance + tranTriggerStr2Distance(_m_top[2], parseFloat(dataset.height));
                    } else if (_m_top[1] === '-') {
                        trigger_distance = trigger_distance - tranTriggerStr2Distance(_m_top[2], parseFloat(dataset.height));
                    }
                    if (scrollTop + windowHeight > trigger_distance) { // 滚动过元素的top
                        triggerAnimation(dom);
                    }
                } else if (/bottom[+-]\d+%?/.test(aniTrigger)) {
                    var _m_bottom = aniTrigger.match(/bottom([+-])(\d+%?)/);
                    var trigger_distance_bottom = parseFloat(dataset.bottom);
                    if (_m_bottom[1] === '+') {
                        trigger_distance_bottom = trigger_distance_bottom + tranTriggerStr2Distance(_m_bottom[2], parseFloat(dataset.height));
                    } else if (_m_bottom[1] === '-') {
                        trigger_distance_bottom = trigger_distance_bottom - tranTriggerStr2Distance(_m_bottom[2], parseFloat(dataset.height));
                    }
                    if (scrollTop + windowHeight > trigger_distance_bottom) { // 滚动过元素的top
                        triggerAnimation(dom);
                    }
                }
            });


        }
        window.addEventListener('scroll', aniShowFunc);
        eachDom(document.querySelectorAll(selector), function (dom, e) {
            dom.style.visibility = "hidden";
        });
        triggerImagesLoaded(function () {
            var keyframes = '';
            eachDom(document.querySelectorAll(selector), function (dom, e) {
                var aniClass = '';
                var aniName = `animation-${e}`, aniDuration = '0.3s', aniFunction = 'ease-in-out', aniDelay = '0s';
                var dataset = dom.dataset;
                var aniList = [];
                for (var key in dataset) {
                    if (key === 'aniClass') {
                        aniClass = dataset[key] || aniClass;
                    } else if (key === 'aniName') {
                        aniName = dataset[key] || aniName;
                    } else if (key === 'aniDuration') {
                        aniDuration = dataset[key] || aniDuration;
                    } else if (key === 'aniFunction') {
                        aniFunction = dataset[key] || aniFunction;
                    } else if (key === 'aniDelay') {
                        aniDelay = dataset[key] || aniDelay;
                    } else if (key === 'aniFrom') {
                        aniList.push({
                            key: 'from',
                            value: dataset[key]
                        });
                        dataset[key].split(";").forEach(function (item) {
                            if (item) {
                                var splitStyle = item.split(":");
                                if (splitStyle.length > 1) {
                                    dom.style[splitStyle[0].trim()] = splitStyle[1].trim();
                                }
                            }
                        });
                    } else if (key === 'aniTo') {
                        aniList.push({
                            key: 'to',
                            value: dataset[key]
                        });
                    } else if (/ani-\d+%/.test(key)) {
                        var _m = key.match(/ani-(\d+%)/);
                        aniList.push({
                            key: _m[1],
                            value: dataset[key]
                        });
                        if (_m[1].trim() === '0%') {
                            dataset[key].split(";").forEach(function (item) {
                                if (item) {
                                    var splitStyle = item.split(":");
                                    if (splitStyle.length > 1) {
                                        dom.style[splitStyle[0].trim()] = splitStyle[1].trim();
                                    }
                                }
                            });
                        }
                    }
                }

                if (aniList.length > 0) {
                    keyframes += getKeyFrames(aniName, aniList);
                }

                var rect = dom.getBoundingClientRect();
                if(rect.height > 0) {
                    dom.setAttribute('data-top', rect.top);
                    dom.setAttribute('data-bottom', rect.bottom);
                    dom.setAttribute('data-left', rect.left);
                    dom.setAttribute('data-right', rect.right);
                    dom.setAttribute('data-width', rect.width);
                    dom.setAttribute('data-height', rect.height);
                    dom.setAttribute('data-animation', `${aniName} ${aniDuration} ${aniFunction} ${aniDelay} forwards`);

                }

            
            });
            style.innerHTML = keyframes;
            aniShowFunc();
        }, autoImageSelector); // 1s后强制执行
    };

}));
