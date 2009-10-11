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
    this.effectOptions = { duration: this.options.transitionDuration };
    this.i = 0;
    this.slides = $$('#' + this.element.identify() + this.options.slidesSelector);
    
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
    /*
      TODO make it bullet proof: figure out how to finish effects
    */
    this.getSlide().fade(this.effectOptions);
    if (this.atEdge(dir)){
      this.i = (dir == 1)? 0 : this.slides.length - 1;
      fire('looped', this);
    } else {
      this.i += dir;
    }
    this.getSlide().show().appear(this.effectOptions);
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

$w('cycled started stopped initialized looped').each(function(s){
  document.observe('slideshow:' + s, function(e){
    console.log(s);
  });
});
