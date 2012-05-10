FnordMetric.widgets.realtimeValueWidget = function(){

    var widget_uid = FnordMetric.util.getNextWidgetUID();
    var width, height, canvas,  opts;

    var xpadding = 20;
    var ypadding = 20;
    var bmargin = 6;
    var bwidth  = 5;
    var bcolor  = '#06C';

    var bars = [];
    var max = 1;

    var next_values = [];
    var next_value_interval = false;

    function render(_opts){
      opts = _opts;

      drawLayout();

      width = opts.elem.width() - (xpadding * 2) - 15;
      height = opts.height || 240;
      //xtick = width / (xticks - 1);

      canvas = d3.select('#container-'+widget_uid)
        .append("svg:svg")
        .attr("width", width+(2*xpadding))
        .attr("height", height+30);

      canvas.selectAll("*").remove();

      for(var n=parseInt(width / bmargin); n > 0; n--){
        drawValue(false, n-1);
      }
    }

    function nextValue(value){
      if (value > max){
        max = value * 1.2;
      }

      drawValue(value);

      canvas.selectAll('.valuebar').each(function(){
        $(this).attr("x",  parseInt($(this).attr('x'))-bmargin);
      });

      pruneValues();
      next_value_interval = false;
      nextValueAsync();
    }

    function nextValueAsync(value){
      if(value){ next_values.unshift(value); }
      if(next_values.length > 0){
        if(!next_value_interval){
          next_value_interval = window.setInterval(function(){
            var _v = next_values.pop();
            if(!!_v){ nextValue(_v); }
          }, 60);  
        }
      }   
    }

    function pruneValues(){
      while(bars.length > (width / bmargin)){
        bars.pop().remove();
      }
    }

    function drawValue(value, offset){
      if(!offset){ offset = 0; }
      if(!value){ value = 0; }

      if(value > 0){ 
        var theight = (height-(ypadding*4)) * (value/max);
        var fillc = bcolor;
      } else {
        var theight = 5;
        var fillc = '#ddd';
      }  
      
      bars.unshift(canvas
        .append("svg:rect")
        .attr("class", "valuebar")
        .attr("x", width+xpadding-(offset*bmargin))
        .attr("y", height-(ypadding*2)-theight)
        .attr("fill", fillc)
        .attr("width", bwidth)
        .attr("height", theight));
    }

    function announce(evt){
      if((evt._class == "widget_push") && (evt.cmd == "value")){
        nextValueAsync(parseInt(evt.value));
      }
      if(evt.widget_key == opts.widget_key){

      }
    }

    function drawLayout(){
      $(opts.elem).append( $('<div></div>').attr('class', 'headbar').append(
        $('<h2></h2>').html(opts.title)
      ) ).append(
        $('<div></div>').attr('id', 'container-'+widget_uid).css({
          height: opts.height + 6,
          marginBottom: 20,
          overflow: 'hidden'
        })
      );

      if(opts.ticks){
        $('.headbar', opts.elem).append('<div class="tick_btns btn_group"></div>');
        for(__tick in opts.ticks){
          var _tick = opts.ticks[__tick];
          $('.tick_btns', opts.elem).append(
            $('<div></div>').attr('class', 'button tick').append($('<span></span>')
              .html(FnordMetric.util.formatTimeRange(_tick)))
              .attr('data-tick', _tick)
              .click(changeTick)  
          );
        }
      }
    }

    return {
      render: render,
      announce: announce
    }

};