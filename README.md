# DragSort

# 用法

```javascript
<View>
  <DragSort 
    dataArray={[1,2,3,4,5,6,7,8,9,10,33]}
    style={{ zIndex: 1000 }} // 保证同级布局中最高
    itemW={90}
    itemH={90}
    itemMargin={15} // 每个item距离顶部和右边的距离
  />
  <DeleteFooter // 底部的删除长条，不需要传任何属性，通过通知的方式控制
  /> 
</View> 
```