/* NDOA interaction layer: jQuery enhancements + Bootstrap-friendly behavior */
(function($){
  'use strict';
  $(function(){
    $('body').addClass('ndoa-ready');
    $('a[href^="#"]').on('click',function(e){
      var target=$(this.getAttribute('href'));
      if(target.length){e.preventDefault();$('html,body').stop().animate({scrollTop:target.offset().top-88},550);}
    });
    if('IntersectionObserver' in window){
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){if(entry.isIntersecting){$(entry.target).addClass('is-visible');observer.unobserve(entry.target);}});
      },{threshold:.12});
      $('.card,.photo,.stat,.panel,.form-wrap').each(function(){this.classList.add('reveal-ready');observer.observe(this);});
    }
    $('.menu').attr({'aria-expanded':'false','aria-controls':'primary-navigation'});
    $('.links').attr('id','primary-navigation');
    $('.menu').on('click',function(){var $button=$(this),$links=$('.links');$links.toggleClass('open');$button.attr('aria-expanded',$links.hasClass('open')?'true':'false').text($links.hasClass('open')?'✕':'☰');});
    $('.links a').on('click',function(){if(window.matchMedia('(max-width: 1050px)').matches){$('.links').removeClass('open');$('.menu').attr('aria-expanded','false').text('☰');}});
    $('img').each(function(){if(!this.hasAttribute('loading'))this.setAttribute('loading','lazy');if(this.alt)this.setAttribute('decoding','async');});
    var current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    $('.links a').each(function(){var href=($(this).attr('href')||'').toLowerCase();if(href===current){$(this).addClass('current').attr('aria-current','page');}else{$(this).removeClass('current').removeAttr('aria-current');}});
    $('form').on('submit',function(){var $form=$(this);window.setTimeout(function(){var $msg=$form.find('[data-form-message]');if($msg.length&&$msg.text().trim())$msg.stop(true,true).hide().fadeIn(250);},80);});
  });
})(jQuery);