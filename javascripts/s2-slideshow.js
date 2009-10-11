var SlideShow = Class.create((function(){
  
  var defaultOptions = {
    duration:           5,
    transitionDuration: 0.5,
    slidesSelector:     ' > *',
    autoPlay:           true,
    loop:               true,
    startHidden:        false
  };
  
  function initialize (element, options) {
    this.element = $(element).store('slideshow', this);
    this.options = defaultOptions;
    Object.extend(this.options, options);
    this.effectOptions = { duration: this.options.transitionDuration, engine: 'javascript' };
    this.i = 0;
    this.slides = $$('#' + this.element.identify() + this.options.slidesSelector);
    this.effects = {};
    (function(){
      if (this.options.startHidden) {
        return this.slides;
      } else {
        return this.slides.without(this.slides[0].show().setStyle('position:absolute'));
      }
    }.bind(this)()).invoke('setStyle', 'display: none; opacity: 0; position: absolute');
    if (this.options.startHidden) this.slides[0].appear(this.effectOptions);
    if (this.options.maxDuration) this.options.duration = this.options.maxDuration/this.slides.length;
    fire('initialized', this);
    if (this.options.autoPlay) this.play();
  }
  
  function fire (name, slideshow) {
    document.fire('slideshow:' + name, { slideshow: slideshow });
  }
  
  function play () {
    if (this.cycling) return;
    this.cycling = new PeriodicalExecuter(this.next.bind(this), this.options.duration);
    fire('started', this);
  }
  
  function stop () {
    if (!this.cycling) return;
    this.cycling.stop();
    delete this.cycling;
    fire('stopped', this);
  }
  
  function cycle (dir) {
    if (this.options.loop == false && this.atEdge(dir)) {
      this.stop();
      return;
    }
    if (this.effects.fade && this.effects.fade.state == 'running') {
      this.effects.fade.finish();
    }
    if (this.effects.appear && this.effects.appear.state == 'running') {
      this.effects.appear.finish();
    }
    
    this.effects.fade = new S2.FX.Morph(this.getSlide(), Object.extend({
      style: 'opacity:0',
      after: Element.hide.curry(this.getSlide())
    }, this.effectOptions)).play();
    
    if (this.atEdge(dir)){
      this.i = (dir == 1)? 0 : this.slides.length - 1;
      fire('looped', this);
    } else {
      this.i += dir;
    }
    this.effects.appear = new S2.FX.Morph(this.getSlide(), Object.extend({
      before: function(){ this.getSlide().show().setStyle({opacity: 0}); }.bind(this),
      style:  'opacity:1'
    }, this.effectOptions)).play();
    
    fire('cycled', this);
  }
  
  return {
    initialize: initialize,
    play:       play,
    stop:       stop,
    next:       cycle.curry(1),
    previous:   cycle.curry(-1),
    atEdge:     function(dir) { return 0 > this.i + dir || this.slides.length <= this.i + dir; },
    getSlide:   function() { return this.slides[this.i]; }
  }
  
})());

Element.addMethods({
  makeSlideShow: function(element, options){
    new SlideShow(element, options);
    return element;
  }
});

// $w('cycled started stopped initialized looped').each(function(s){
//   document.observe('slideshow:' + s, function(e){
//     console.log(s);
//   });
// });

