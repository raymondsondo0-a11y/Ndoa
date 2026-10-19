/* NDOA interaction layer: jQuery enhancements + Bootstrap-friendly behavior */
(function($){
  'use strict';
  $(function(){
    $('body').addClass('ndoa-ready');
    // Smooth in-page navigation and gentle reveal for content sections.
    $('a[href^="#"]').on('click',function(e){
      var target=$(this.getAttribute('href'));
      if(target.length){e.preventDefault();$('html,body').stop().animate({scrollTop:target.offset().top-88},550);}
    });
    // Reveal content as it enters the viewport, without hiding content if JS is unavailable.
    if('IntersectionObserver' in window){
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){$(entry.target).addClass('is-visible');observer.unobserve(entry.target);}
        });
      },{threshold:.12});
      $('.card,.photo,.stat,.panel,.form-wrap').each(function(){this.classList.add('reveal-ready');observer.observe(this);});
    }
    // Accessible mobile navigation, controlled only by jQuery.\n    $('.menu').attr({'aria-expanded':'false','aria-controls':'primary-navigation'});\n    $('.links').attr('id','primary-navigation');\n    $('.menu').on('click',function(){var $button=$(this),$links=$('.links');$links.toggleClass('open');$button.attr('aria-expanded',$links.hasClass('open')?'true':'false').text($links.hasClass('open')?'✕':'☰');});\n    $('.links a').on('click',function(){if(window.matchMedia('(max-width: 1050px)').matches){$('.links').removeClass('open');$('.menu').attr('aria-expanded','false').text('☰');}});\n    // Add keyboard-friendly image captions and lazy-load remote gallery imagery.
    $('img').each(function(){
      if(!this.hasAttribute('loading'))this.setAttribute('loading','lazy');
      if(this.alt)this.setAttribute('decoding','async');
    });
    // Highlight the current page link, including links with slightly different labels.
    var current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    $('.links a').each(function(){
      var href=($(this).attr('href')||'').toLowerCase();
      if(href===current){$(this).addClass('current').attr('aria-current','page');}
      else{$(this).removeClass('current').removeAttr('aria-current');}
    });
    // Add a small, polished feedback message after local/demo forms submit.
    $('form').on('submit',function(){
      var $form=$(this);
      window.setTimeout(function(){
        var $msg=$form.find('[data-form-message]');
        if($msg.length && $msg.text().trim())$msg.stop(true,true).hide().fadeIn(250);
      },80);
    });
  });
})(jQuery);
