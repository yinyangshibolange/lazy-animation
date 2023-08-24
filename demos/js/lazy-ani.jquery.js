(function ($) {
    var imagesLoadedCallbacks = [], loadedImageCount = 0
    function triggerImagesLoaded (callback, imageSelector = "img", forceTime = 0) {
        imagesLoadedCallbacks.push(callback)
        var timer;
        function callFunctions () {
            if (timer) clearTimeout(timer)
            timer = setTimeout(function () {
                if (Array.isArray(imagesLoadedCallbacks) && imagesLoadedCallbacks.length > 0) {
                    for (var k = 0; k < imagesLoadedCallbacks.length; k++) {
                        if (typeof imagesLoadedCallbacks[k] === 'function') {
                            imagesLoadedCallbacks[k]()
                        }
                    }
                    if (loadedImageCount >= $(imageSelector).length) imagesLoadedCallbacks = []
                }
            }, 200)
        }
        if (imagesLoadedCallbacks.length === 1) {
            var $images = $(imageSelector)
            $(document).ready(function () {
                $images.each(function () {
                    if ($(this).height() > 0) { // 如果缓存了图片，那么load事件不会触发
                        loadedImageCount += 1
                    } else {
                        $(this).on('load', function (ev) {
                            loadedImageCount += 1
                            callFunctions()
                        })
                    }
                })
                setTimeout(function () {
                    if (loadedImageCount >= $images.length) {
                        callFunctions()
                    }
                }, 100)
                if (forceTime) { // 强制时间到了之后，强制执行回调
                    setTimeout(function () {
                        $images.off("load")
                        callFunctions()
                    }, forceTime)
                }
            })
        }

    }

    var $style = $(`<style></style>`)
    $("head").append($style)

    $(document).ready(function () {
        function addKeyFrames (animationName, list) {
            var keyframes = `@keyframes ${animationName} {
                                ${list.map(item => item.key + '{' + item.value + '}').join('\n')}
                            }
                            `
            $style.append(keyframes)
        }

        var windowHeight = $(window).height()
        function aniShowFunc (ev) {
            var scrollTop = $(window).scrollTop()

            $(".lazy-ani").each(function (e) {
                var $this = $(this)
                var dataset = $this[0].dataset
                var aniTrigger = dataset.aniTrigger || 'bottom'
                var animation = dataset.animation
                var aniClass = dataset.aniClass

                function triggerAnimation ($dom) {
                    if (aniClass) {
                        $dom.addClass(aniClass).css('visibility', 'visible')
                    } else {
                        $dom.css("animation", animation).css('visibility', 'visible')
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
                        triggerAnimation($this)
                    }
                } else if (aniTrigger === 'bottom') {
                    if (scrollTop + windowHeight > parseFloat(dataset.bottom)) { // 滚动过元素的top
                        triggerAnimation($this)
                    }
                } else if (/top[+-]\d+%?/.test(aniTrigger)) {
                    var _m_top = aniTrigger.match(/top([+-])(\d+%?)/)
                    var trigger_distance = parseFloat(dataset.top)
                    if (_m_top[1] === '+') {
                        trigger_distance = trigger_distance + tranTriggerStr2Distance(_m_top[2], parseFloat(dataset.height))
                    } else if (_m_top[1] === '-') {
                        trigger_distance = trigger_distance - tranTriggerStr2Distance(_m_top[2], parseFloat(dataset.height))
                    }
                    if (scrollTop + windowHeight > trigger_distance) { // 滚动过元素的top
                        triggerAnimation($this)
                    }
                } else if (/bottom[+-]\d+%?/.test(aniTrigger)) {
                    var _m_bottom = aniTrigger.match(/bottom([+-])(\d+%?)/)
                    var trigger_distance_bottom = parseFloat(dataset.bottom)
                    if (_m_bottom[1] === '+') {
                        trigger_distance_bottom = trigger_distance_bottom + tranTriggerStr2Distance(_m_bottom[2], parseFloat(dataset.height))
                    } else if (_m_bottom[1] === '-') {
                        trigger_distance_bottom = trigger_distance_bottom - tranTriggerStr2Distance(_m_bottom[2], parseFloat(dataset.height))
                    }
                    if (scrollTop + windowHeight > trigger_distance_bottom) { // 滚动过元素的top
                        triggerAnimation($this)
                    }
                }


            })
        }
        $(window).scroll(aniShowFunc)

        $(".lazy-ani").css("visibility", "hidden")

        triggerImagesLoaded(function () {
            $(".lazy-ani").each(function (e) {
                var $this = $(this)
                var aniClass = ''
                var aniName = `animation-${e}`, aniDuration = '0.3s', aniFunction = 'ease-in-out', aniDelay = '0s'
                var dataset = $this[0].dataset
                var aniList = []
                for (var key in dataset) {
                    if (key === 'aniClass') {
                        aniClass = dataset[key] || aniClass
                    } else if (key === 'aniName') {
                        aniName = dataset[key] || aniName
                    } else if (key === 'aniDuration') {
                        aniDuration = dataset[key] || aniDuration
                    } else if (key === 'aniFunction') {
                        aniFunction = dataset[key] || aniFunction
                    } else if (key === 'aniDelay') {
                        aniDelay = dataset[key] || aniDelay
                    } else if (key === 'aniFrom') {
                        aniList.push({
                            key: 'from',
                            value: dataset[key]
                        })
                        dataset[key].split(";").forEach(function (item) {
                            if (item) {
                                var splitStyle = item.split(":")
                                if (splitStyle.length > 1) {
                                    $this.css(splitStyle[0].trim(), splitStyle[1].trim())
                                }
                            }
                        })
                    } else if (key === 'aniTo') {
                        aniList.push({
                            key: 'to',
                            value: dataset[key]
                        })
                    } else if (/ani-\d+%/.test(key)) {
                        var _m = key.match(/ani-(\d+%)/)
                        aniList.push({
                            key: _m[1],
                            value: dataset[key]
                        })
                        if (_m[1].trim() === '0%') {
                            dataset[key].split(";").forEach(function (item) {
                                if (item) {
                                    var splitStyle = item.split(":")
                                    if (splitStyle.length > 1) {
                                        $this.css(splitStyle[0].trim(), splitStyle[1].trim())
                                    }
                                }
                            })
                        }
                    }
                }

                var rect = $this[0].getBoundingClientRect()
                $this.attr({
                    'data-top': rect.top,
                    'data-bottom': rect.bottom,
                    'data-left': rect.left,
                    'data-right': rect.right,
                    'data-width': rect.width,
                    'data-height': rect.height,
                    'data-animation': `${aniName} ${aniDuration} ${aniFunction} ${aniDelay} forwards`
                })
                if (aniList.length > 0) {
                    addKeyFrames(aniName, aniList)
                }
            })
            aniShowFunc()
        }, 'img', 1000) // 1s后强制执行
    })
})(jQuery)
