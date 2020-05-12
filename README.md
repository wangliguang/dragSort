# DragSort

之前负责的一个需求，让在RN端做仿微信朋友圈的图片删除和排序，由于经验和时间限制，就跟PM协商改为点击删除，由此欠下一个技术栈，今天是来还债的。


思路：使用动画transform，不想使用定位
 * 1. 初始时,将数据源转化为如下格式
      1) 原始内容(data) 
      2) 算出每项位置(originX/originY)，
      3) 每项transfrom动画的x/y都置为0 
      4) 初始下标originIndex
 * 2. 渲染时，新数据源属性做如下分配
      1) 收集每个item的ref引用
      2）将transAnimated赋值给拖拽组件
      3）将新构造的数据源中originIndex给到onMove事件，不要使用map中的index,因为每次排序该值都不会变
 * 2. 开始拖拽，将如下属性赋值给this.touchCurItem
      1) 拖拽item引用(ref)
      2）拖拽item的下标(index)
      3）将要到达的位置(moveToIndex)，初始为0
 * 3. 拖拽中，不断计算所有item(除拖拽项)将要到达的位置，然后用动画移动
      1) 将改项的zIndex属性置顶
      2) 向四个方向移动一半位置就触发排序
      3）动画实现的相对偏移量
 * 4. 拖拽结束
      1) 通过flattenOffset重置所有item的偏移量 // https://future-challenger.gitbooks.io/react-native-animation/flattenoffset.html
      2）判断移动是否达到移动标准，若是：动画方式返回原位置，否：动画偏移到新位置
      3）重新计算数据源中的每个属性
      4) 将touchCurItem置null
 * 
 * 注意点：
 *  1）3-1)中性能上应该使用setNativeProps，但实验RN版本中改方法已经取消
 */