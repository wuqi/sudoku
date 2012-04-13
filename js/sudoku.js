$(function(){
  var size = 9;
  var startTime = 0;
  var usedTime = 0;
  var gameState = 'init';
  var layout = [];
  var answer = [];
  var answerPosition = [];
  var solving = [];
  var solvingStack=[];
  var gameTimer = null;
  var choosing = {
		row : 0,
		col : 0
	};
	// 初始化
  function init(){
		startTime = new Date().getTime();
		usedTime = 0;
		for (var i = 0; i <  size; i++) {
			for (var j = 0; j <  size; j++) {
				layout[i *  size + j] = 0;
				solving[i *  size + j] = 0;
				answerPosition[i *  size + j] = 0;
				for (var h = 0; h <  size; h++) {
					answer[i *  size *  size + j *  size + h] = 0;
				}
			}
		}
	}
	// 判断生成的游戏局面是否只有一种答案
	function checkUnique() {
		var res = [];
		for (var r1 = 0; r1 < size - 1; r1++) {
			for (var r2 = r1 + 1; r2 < size; r2++) {
				for (var c1 = 0; c1 < size - 1; c1++) {
					for (var c2 = c1 + 1; c2 < size; c2++) {
						if (layout[r1 * size + c1] == layout[r2
								* size + c2]
								&& layout[r1 * size + c2] == layout[r2
										* size + c1]) {
							res.push([r1, r2, c1, c2]);
						}
					}
				}
			}
		}
		return res;
	}
	// 生成游戏局面
	function generate() {
		init(size);
		var curRow = 0, curCol = 0;
		while (curRow != size) {
			if (answerPosition[curRow * size + curCol] == 0)
				getAnswer(curRow, curCol);// 如果这个位置没有被回溯过，就不用重新计算解空间
			var ansCount = getAnswerCount(curRow, curCol);
			if (ansCount == answerPosition[curRow * size + curCol]
					&& curRow == 0 && curCol == 0)
				break;// 全部回溯完毕
			if (ansCount == 0) {
				answerPosition[curRow * size + curCol] = 0;// 无可用解，应该就是0
				if (curCol > 0) {
					curCol--;
				} else if (curCol == 0) {
					curCol = 8;
					curRow--;
				}
				layout[curRow * size + curCol] = 0;
				continue;
			}
			// 可用解用完
			else if (answerPosition[curRow * size + curCol] == ansCount) {
				answerPosition[curRow * size + curCol] = 0;
				if (curCol > 0) {
					curCol--;
				} else if (curCol == 0) {
					curCol = 8;
					curRow--;
				}
				layout[curRow * size + curCol] = 0;
				continue;
			} else {
				// 返回指定格中，第几个解
				layout[curRow * size + curCol] = getAnswerNum(curRow, curCol, answerPosition[curRow * size + curCol]);
				answerPosition[curRow * size + curCol]++;
				if (curCol == 8) {
					curCol = 0;
					curRow++;
				} else if (curCol < 8) {
					curCol++;
				}
			}
		}
	}
 // 取指定行列的答案
 function getAnswer(row, col) {
		for (var i = 1; i <= size; i++) {
			answer[row * size * size + col * size + i - 1] = i;// 假定包含所有解
		}
		// 去除已经包含的
		for (var i = 0; i < size; i++) {
			if (layout[i * size + col] != 0) {
				answer[row * size * size + col * size	+ layout[i * size + col] - 1] = 0;// 去除列中包含的元素
			}
			if (layout[row * size + i] != 0) {
				answer[row * size * size + col * size	+ layout[row * size + i] - 1] = 0;// 去除行中包含的元素
			}
		}
		var subnum = Math.floor(Math.sqrt(size));
		var x = Math.floor(row / subnum);
		var y = Math.floor(col / subnum);
		for (var i = x * subnum; i < subnum + x * subnum; i++) {
			for (var j = y * subnum; j < subnum + y * subnum; j++) {
				if (layout[i * size + j] != 0)
					answer[row * size * size + col * size	+ layout[i * size + j] - 1] = 0;// 去小方格中包含的元素
			}
		}
		randomAnswer(row, col);
	}
		// 对指定行列的答案随机排序
	function randomAnswer(row, col) {
		// 随机调整一下顺序
		var list = [];
		for (var i = 0; i < size; i++)
			list.push(answer[row * size * size + col * size	+ i]);
		var rdm = 0, idx = 0;
		while (list.length != 0) {
			rdm = Math.floor(Math.random() * list.length);
			answer[row * size * size + col * size + idx] = list[rdm];
			list.splice(rdm, 1);
			idx++;
		}
	}
	// 计算指定行列可用解的数量
	 function getAnswerCount(row, col) {
		var count = 0;
		for (var i = 0; i < size; i++)
			if (answer[row * size * size + col * size + i] != 0)
				count++;
		return count;
	}
	function getAnswerNum(row, col, ansPos) {
		// 返回指定布局方格中指定位置的解
		var cnt = 0;
		for (var i = 0; i < size; i++) {
			// 找到指定位置的解，返回
			if (cnt == ansPos
					&& answer[row * size * size + col	* size + i] != 0)
				return answer[row * size * size + col * size + i];
			if (answer[row * size * size + col * size + i] != 0)
				cnt++;// 是解，调整计数器
		}
		return 0;// 没有找到，逻辑没有问题的话，应该不会出现这个情况
	}
	//难度
	function getLevel() {
     var checkIndex=$("#level").get(0).selectedIndex; 
     return checkIndex+1;
	}
		// 将时间间隔转换为时间字符串，如90秒转化为：00:01:30
	function changeTimeToString(time) {
		var res = '';
		var h = Math.floor(time / 3600);
		if (h < 10) {
			h = '0' + h;
		}
		var m = time % 3600;
		m = Math.floor(m / 60);
		if (m < 10) {
			m = '0' + m;
		}
		var s = time % 60;
		if (s < 10) {
			s = '0' + s;
		}
		res = h + ':' + m + ':' + s;
		return res;
	}
	// 重新开局
	function restart() {
		// 游戏局面生成
		generate(size);
		$("td").unbind();
		// 游戏难度级别
		var checkedIndex = getLevel();
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				var cell = $('#cell_' + i + '_' + j);
				cell.css("font-weight","normal").css("color",'#000').text(' ');
				var subSize = 3;
				var r = Math.floor(i / subSize);
				var c = Math.floor(j / subSize);
				if (r % 2 == c % 2) {
					cell.css("background-color",'#ddc');
				}
				var rdm = Math.floor(Math.random() * 6);
				if (rdm > checkedIndex) {
					cell.text(layout[i * size + j]);
					solving[i * size + j] = layout[i * size	+ j];
				} else {
					// 获取焦点时，为同行，同列和所在九宫格添加背景色
					cell.hover(function() {
                  var id = this.id;
                  var i = Number(id.split('_')[1]);
                  var j = Number(id.split("_")[2]);
                  for (var h = 0; h <size; h++) {
                    if (h != i) {
                      $('#cell_' + h + '_' + j).css("background-color","#cfc");// 所在列变色
                    }
                    if (h != j) {
                      $('#cell_' + i + '_' + h).css("background-color",'#cfc');// 所在行变色
                    }
                  }
                  // 所在的九宫格变色
                  var sub = Math.floor(Math.sqrt(size));
                  var subRow = Math.floor(i / sub);
                  var subCol = Math.floor(j / sub);
                  for (var ix = subRow * sub; ix < subRow * sub + sub; ix++) {
                    for (jx = subCol * sub; jx < subCol * sub + sub; jx++) {
                      $('#cell_' + ix + '_' + jx).css("background-color",'#cfc');
                    }
                  }
              }, function() {
                    var id = this.id;
                    var i = Number(id.split('_')[1]);
                    var j = Number(id.split("_")[2]);
                    var subSize = Math.floor(Math.sqrt(size));
                    var r = Math.floor(i / subSize);
                    var c = Math.floor(j / subSize);
                    for (var h = 0; h < size; h++) {
                      var sh = Math.floor(h / subSize);
                      if (h != i) {
                        if (sh % 2 == c % 2) {
                          $('#cell_' + h + '_' + j).css("background-color",'#ddc');
                        } else {
                          $('#cell_' + h + '_' + j).css("background-color",'#fff');
                        }// 所在列颜色恢复
                      }
                      if (h != j) {
                        if (sh % 2 == r % 2) {
                          $('#cell_' + i + '_' + h).css("background-color",'#ddc');
                        } else {
                          $('#cell_' + i + '_' + h).css("background-color",'#fff');
                        }// 所在行颜色恢复
                      }
                    }
                    // 所在的九宫格变色
                    var bgColor = (c % 2 == r % 2) ? '#ddc' : '#fff';
                    var sub = Math.floor(Math.sqrt(size));
                    var subRow = Math.floor(i / sub);
                    var subCol = Math.floor(j / sub);
                    for (var iz = subRow * sub; iz < subRow * sub + sub; iz++) {
                      for (var jz = subCol * sub; jz < subCol * sub + sub; jz++) {
                        $('#cell_' + iz + '_' + jz).css("background-color",bgColor);
                      }
                    }
              });
   					// 点击时，弹出选择答案窗口
					  cell.click(function(e){
					  var rc = $(this).attr('id').split('_');
						choosing.row = Number(rc[1]);
			      choosing.col = Number(rc[2]);
			      var cellnow = null;
			      cellnow = $(this);
						var np =  $("#numPicker");
						np.css("display","block").css("left",e.pageX ).css("top",e.pageY).css("background-color","#fff");
            $("#numPicker td").hover(function(){
            $(this).css("background-color","#ccc");
          },function(){
            $(this).css("background-color","#fff");
          }).click(function(){
            choose($(this).text());
            $("#numPicker").css("display","none").unbind();});
            });
				}
			}
		}

		// 消除可能存在的多解情形
		var isUnique = checkUnique();
		for (i = 0; i < isUnique.length; i++) {
			var r1 = isUnique[i][0];
			var r2 = isUnique[i][1];
			var c1 = isUnique[i][2];
			var c2 = isUnique[i][3];
			// 如果多解的四个格子都为空
			if (solving[r1 * size + c1] == 0
					&& solving[r1 * size + c2] == 0
					&& solving[r2 * size + c1] == 0
					&& solving[r2 * size + c2] == 0) {
				// 四个空中，随机填上一个
				var rdm = Math.floor(Math.random() * 4);
				var r = isUnique[i][Math.floor(rdm / 2)];
				var c = isUnique[i][rdm % 2 + 2];
				var cell = $('#cell_' + r + '_' + c);
				cell.text(layout[r * size + c]);
				solving[r * size + c] = layout[r * size + c];
			}
		}
	}
	//选择数字
	function choose(id)
	{
      var c= id;
      var t=$('#cell_'+choosing.row+'_'+choosing.col);
      var previous = t.text();
      if(id != previous){
      t.html(c);
      t.css("font-weight","bold")
      solvingStack.push([choosing.row,choosing.col, previous]);
		  onSelect(c,choosing.row,choosing.col);
		  }
	}
	// 当输入答案时，检查是否有冲突
	function onSelect(v, i, j) {
		var cp = getCheckingPosition(i, j);
		var flag = true;
		for (var h = 0; h < cp.length; h++) {
			var r = cp[h][0];
			var c = cp[h][1];
			if (solving[r * size + c] == v) {
				flag = false;
				// 有冲突的标记为红色
				$('#cell_' + r + '_' + c).css("background-color","#f00");
			}
		}
		// 如果没有冲突
		solving[i * size + j] = v;
	}
	// 取得某格所在行，列，九宫格的所有行列号
	function getCheckingPosition(i, j) {
		var res = [];
		for (var h = 0; h < size; h++) {
			if (h != i)
				res.push([h, j])
			if (h != j)
				res.push([i, h]);
		}
		var sub = Math.floor(Math.sqrt(size));
		var subRow = Math.floor(i / sub);
		var subCol = Math.floor(j / sub);
		for (var x = subRow * sub; x < subRow * sub + sub; x++) {
			for (var y = subCol * sub; y < subCol * sub + sub; y++) {
				if (x != i || y != j) {
					res.push([x, y]);
				}
			}
		}

		return res;
	}	
	//开始游戏
	function start() {
    if($('#pause').val() =='继续'){
      return;
    }
		// 重新生成游戏局面
		restart();
		// 判断当前游戏状态
		if (gameState == 'continue' || gameState == 'start') {
			clearInterval(gameTimer);
		} else {
			$('#pause').val('暂停');
		}
		// 修改游戏状态
		gameState = 'start';

		// 开始计时
		startTime = new Date().getTime();
		var timer = $('#timer');
		gameTimer = setInterval(function() {
			var time = Math.floor((new Date().getTime() - startTime)/ 1000);
			timer.text(changeTimeToString(time));
		}, 1000);
	}
  $("#reset").click(function(){
     start();
  });
  //暂停
  $("#pause").click(function(){
    if (gameState != 'init') {
      if ($(this).val() == '暂停') {
        $(this).val('继续');
        gameState = 'pause';
      } else {
        $(this).val('暂停');
        gameState = 'continue';
      }
      // 当继续时，重新开始计时
      if (gameState == 'continue') {
        // 除去蒙板
        $('#wp').fadeToggle(800);

        startTime = new Date().getTime();
        gameTimer = setInterval(function() {
          var time = Math.floor(usedTime + (new Date().getTime() - startTime) / 1000);
          timer.innerHTML = changeTimeToString(time);
        }, 1000);
      }
      // 暂停时，停止计时，并将已用的时间记录下来
      else {
        clearInterval(gameTimer);
        var t = Math.floor((new Date().getTime() - startTime) / 1000);
        usedTime += t;
        $('#wp').fadeToggle(800);
      }
		}
  });
  //完成
  $("#finish").click(function(){
   	var flag = true;

		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				//if (solving[i * size + j] != layout[i	* size + j]) {
				if ($('#cell_' + i + '_' + j).text() != layout[i	* size + j]) {
					flag = false;
					$('#cell_' + i + '_' + j).css("background-color","#f00");
					break;
				}
			}
			if (!flag)
				break;
		}

		if (flag && gameState != 'init') {
			var t = Math.floor((new Date().getTime() - startTime) / 1000);
			clearInterval(gameTimer);
			$("#pageOverlay").fadeIn(400);
			$("#again").fadeIn(400);
			$("#usedtime").text(changeTimeToString(t + usedTime));
			$("#yes").hover(function(){$(this).css("border","3px inset #8a8");},function(){$(this).css("border","3px outset #8a8");}).click(function(){
		  	$(this).css("border","3px outset #8a8");
        $("#pageOverlay").fadeOut(400);
        $("#again").fadeOut(400);
        start();
        $(this).unbind();
			});
			$("#no").hover(function(){$(this).css("border","3px inset #8a8");},function(){$(this).css("border","3px outset #8a8");}).click(function(){
				$(this).css("border","3px outset #8a8");
        $("#pageOverlay").fadeOut(400);
        $("#again").fadeOut(400);
        $('#timer').html('00:00:00');
        $(this).unbind();
			});		
			}
  });
  //撤销
  $("#cacel").click(function(){
  		if (solvingStack.length > 0) {
			var ss = solvingStack.pop();
			solving[ss[0] * size + ss[1]] = ss[2];
			$('#cell_' + ss[0] + '_' + ss[1]).text(ss[2]);
		}
  });
  //显示答案
  $("#answer").click(function(){
   		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
        var cell = $("#cell_"+i+"_"+ j);
        if(cell.text() != layout[i	* size + j])
        {
				cell.text(layout[i	* size + j]).css("font-weight","bold").css("color","#0f5");
				}
				cell.unbind();
			}
		}
  });
});