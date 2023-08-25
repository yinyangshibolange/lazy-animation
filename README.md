
# lazy-ani.js

lazy-ani.js是一个js库，他可以实现动态添加动画效果，包大小仅6kb

## 使用场景

在滚动到一个元素的指定位置时，触发设定的动画，指定位置可以相对元素进行上下设置

## 使用方法

### 设定动画

设定动画的方式一共有三种，

- 第一种：class方式

animate.css有很多优秀的动画效果，我们以这个动画效果库为例，先将这个animate.css引入到html head中，
```html
 <link rel="stylesheet" href="animate.min.css">
```
然后再在需要设置动画效果的dom元素中设置
```html
<img src="..." class="lazy-ani" data-ani-class="animate__animated animate__fadeInTopLeft">
```

最后初始化lazyAni即可
```html
<script>
lazyAni()
</script>
```

- 第二种：自定义animation方式

这种方式分两种情况
a. 在data中设置keyframes动画，style中动态添加keyframes
在dataset中设置keyframes关键帧,比如在dom中写

```html
<img src="..." class="lazy-ani" data-ani-0%="transform: rotate(180deg)" data-ani-50%="transform: rotate(100deg)" data-ani-100%="transform: rotate(0deg)">
```

那么在调用lazyAni() 之后会在head节点在动态添加如下代码
```html
<style>
	@keyframes animation-${k} {
	 0% {transform: rotate(180deg)}
	 50% {transform: rotate(100deg)}
	 100% {transform: rotate(0deg)}
	}
</style>
```
ps: 支持from和to，分别用data-ani-from和data-ani-to进行设置

animation-${k}是默认动画名称（因为没有设置data-ani-name），k是当前html中的第k个lazy-ani元素。如果在dom设置data-ani-name的话，style中的keyframes的名称就会是data-ani-name的值

另外还有三个可设置的参数，分别是
data-ani-duration // 动画持续时间，对应css3中animation动画的duration参数，默认0.3s
data-ani-function // 对应css3中animation动画的timing function参数，默认ease-in-out
data-ani-delay //  延迟触发事件，对应css3中animation动画的delay参数，默认0s

b. 已经定义好keyframes

这种情况和上一种情况就差了已经设置好了keyframe名称，比如说我想用复用某个元素设置的自定义动画，此时就不需要再次定义动画，直接设置和那个元素设置的动画名称一样的动画名称即可。

```html
<img src="..." class="lazy-ani" data-ani-name="tranRotate" data-ani-0%="transform: rotate(180deg)" data-ani-50%="transform: rotate(100deg)" data-ani-100%="transform: rotate(0deg)">

<!-- 第二个图片拥有与上一个图片一样的动画效果 -->
<img src="..." class="lazy-ani" data-ani-name="tranRotate">
```


另外也可以自行在css文件或者style节点下定义keyframes，然后使用定义好的动画名称
```html
<style>
	@keyframes fadein {
	from {opacity: 0}
	to {opacity: 1}
	}
</style>
<img src="..." class="lazy-ani" data-ani-name="fadein">
```
这种情况的动画参数data-ani-duration，data-ani-function，data-ani-delay与上一种情况一致，这里就不再赘述

### 设定动画触发位置

触发位置的设置参数是data-ani-trigger,可选值有top,bottom,top+(\d+),top+(\d+%),top-(\d+),top-(\d+%),bottom+(\d+),bottom+(\d+%),bottom-(\d+),bottom-(\d+%)

- top,bottom好理解，就是元素的顶部和元素底部，当滚动到这些位置时触发动画

- \d+表示数字，比如5，10，100等等，比如top+100就表示元素顶部往下100px触发

- \d+%表示百分数,比如30%，50%等等，这个百分数对应的是元素的高度，比如top+50%和bottom-50%就是到元素的中间位置触发动画

### 注意: lazy-ani.js如果要和lazyload.js一起使用，那么必须固定lazyload的图片的宽高，否者会定位不准。如果懒加载的图片没有使用lazy-ani动画，那么只要让他脱离文档流，这样的话也不会影响其他动画的触发。
