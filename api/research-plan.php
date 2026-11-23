<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

function reply(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function enforceRateLimit(): void {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash('sha256', $ip);
    $file = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.'primonizer-rate-'.$key.'.json';
    $now = time(); $limit = 30; $window = 600;
    $handle = @fopen($file, 'c+');
    if ($handle && flock($handle, LOCK_EX)) {
        $raw = stream_get_contents($handle); $state = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($state) || !isset($state['start'],$state['count']) || $now-(int)$state['start'] >= $window) $state=['start'=>$now,'count'=>0];
        $state['count']=(int)$state['count']+1; ftruncate($handle,0); rewind($handle); fwrite($handle,json_encode($state)); fflush($handle); flock($handle,LOCK_UN); fclose($handle);
        if ($state['count'] > $limit) { header('Retry-After: '.max(1,$window-($now-(int)$state['start']))); reply(429,['success'=>false,'message'=>'Too many requests. Please wait a few minutes and try again.']); }
        return;
    }
    if (is_resource($handle)) fclose($handle);
    if (session_status() !== PHP_SESSION_ACTIVE) @session_start();
    if (session_status() === PHP_SESSION_ACTIVE) {
        $state=$_SESSION['primonizer_rate']??['start'=>$now,'count'=>0];
        if (!is_array($state)||$now-(int)($state['start']??0)>=$window) $state=['start'=>$now,'count'=>0];
        $state['count']++; $_SESSION['primonizer_rate']=$state;
        if ($state['count']>$limit) reply(429,['success'=>false,'message'=>'Too many requests. Please wait a few minutes and try again.']);
    }
}

function cleanText(mixed $value, int $limit): string {
    if (!is_string($value) && !is_numeric($value)) return '';
    $value = trim((string)$value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $limit, 'UTF-8') : substr($value, 0, $limit * 4);
}
function webSearch(string $query): array {
    if (!function_exists('curl_init')) return [];
    $url = 'https://html.duckduckgo.com/html/?q='.rawurlencode($query);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 14,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; PrimonizerResearch/1.0)',
        CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml']
    ]);
    $html = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if (!is_string($html) || $code < 200 || $code >= 300 || !class_exists('DOMDocument')) return [];
    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML($html);
    $xp = new DOMXPath($doc);
    $nodes = $xp->query('//a[contains(concat(" ", normalize-space(@class), " "), " result__a ")]');
    $out = [];
    if ($nodes) foreach ($nodes as $node) {
        $title = trim($node->textContent);
        $href = trim($node->getAttribute('href'));
        $snippetNode = $xp->query('ancestor::div[contains(@class,"result")]//a[contains(@class,"result__snippet")]|following::a[contains(@class,"result__snippet")][1]', $node)->item(0);
        $snippet = $snippetNode ? trim($snippetNode->textContent) : '';
        if ($title !== '' && $href !== '' && preg_match('~^https?://~i', $href)) {
            $out[] = ['title'=>cleanText($title,180),'url'=>$href,'snippet'=>cleanText($snippet,420)];
        }
        if (count($out) >= 5) break;
    }
    libxml_clear_errors();
    return $out;
}
function containsAny(string $s, array $words): bool {
    foreach ($words as $w) if (stripos($s, $w) !== false) return true;
    return false;
}
function chooseChannels(string $type, string $offer, string $audience, string $goal, string $preferred): array {
    if ($preferred !== 'auto' && $preferred !== 'Multi-platform') return [$preferred];
    $s = strtolower($type.' '.$offer);
    if (containsAny($s,['hotel','lodge','guest house','restaurant','food','chakula','hoteli','mgahawa'])) return ['Instagram','Facebook','WhatsApp Status','Google Business Profile'];
    if (containsAny($s,['real estate','plot','land','house','property','kiwanja','ardhi','nyumba'])) return ['Facebook','WhatsApp Status','Instagram'];
    if (containsAny($s,['clothes','fashion','beauty','nguo','mitindo','urembo'])) return ['TikTok','Instagram','WhatsApp Status'];
    if (containsAny($s,['car','garage','vehicle','scanner','gari','gereji','magari'])) return ['Facebook','TikTok','WhatsApp Status'];
    if (containsAny($s,['school','training','course','education','elimu','mafunzo'])) return ['Facebook','Instagram','WhatsApp Status'];
    if (containsAny($s,['farm','agriculture','livestock','kilimo','mifugo'])) return ['Facebook','WhatsApp Status','YouTube'];
    if ($goal === 'traffic') return ['Facebook','Instagram','Website'];
    if ($goal === 'messages' || $goal === 'sales') return ['WhatsApp Status','Facebook','Instagram'];
    return ['Facebook','Instagram','TikTok'];
}
function buildCaption(string $language, string $business, string $offer, string $angle, string $notes, string $goal): string {
    $cta = $goal === 'visits' ? ($language === 'Swahili' ? 'Tembelea biashara yetu au wasiliana nasi upate maelekezo.' : 'Visit us or contact us for directions.')
      : ($goal === 'traffic' ? ($language === 'Swahili' ? 'Tembelea tovuti yetu kupata maelezo zaidi.' : 'Visit our website to learn more.')
      : ($language === 'Swahili' ? 'Tuandikie au tupigie simu upate maelezo zaidi.' : 'Message or call us to learn more.'));
    if ($language === 'Swahili') return $business.': '.$angle.' kuhusu '.$offer.'. '.$cta.($notes !== '' ? ' '.$notes : '');
    return $business.': '.$angle.' about '.$offer.'. '.$cta.($notes !== '' ? ' '.$notes : '');
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') reply(405, ['success'=>false,'message'=>'Use POST to create a research-based campaign plan.']);
if (!function_exists('curl_init')) reply(503, ['success'=>false,'message'=>'This hosting account needs PHP cURL enabled for public web research.']);
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    if ($originHost === '' || $requestHost === '' || !hash_equals($requestHost, $originHost)) reply(403,['success'=>false,'message'=>'Cross-site requests are not accepted.']);
}
enforceRateLimit();
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 30000) reply(413, ['success'=>false,'message'=>'The campaign request is too large.']);
$r = json_decode($raw, true);
if (!is_array($r)) reply(400, ['success'=>false,'message'=>'Invalid campaign request.']);
$type=cleanText($r['businessType']??'',180); $name=cleanText($r['businessName']??'',180);
$offer=cleanText($r['offer']??'',1200); $audience=cleanText($r['audience']??'',180);
$goal=cleanText($r['goal']??'awareness',40); $preferred=cleanText($r['preferredMedia']??'auto',60);
$start=cleanText($r['startDate']??'',10); $notes=cleanText($r['notes']??'',1800);
$lang=cleanText($r['language']??'English',20); $budgetRaw=$r['budget']??null;
if ($type===''||$name===''||$offer===''||$start===''||!is_numeric($budgetRaw)) reply(422,['success'=>false,'message'=>'Complete business type, business name, product/service, start date and monthly budget.']);
$budget=(float)$budgetRaw;
if (!is_finite($budget)||$budget<0||$budget>1000000000000) reply(422,['success'=>false,'message'=>'Enter a valid monthly budget in TZS.']);
if (!in_array($goal,['messages','visits','sales','awareness','traffic'],true)) $goal='awareness';
$allowed=['WhatsApp Status','Instagram','Facebook','TikTok','YouTube','Google Business Profile','Website','LinkedIn','Radio','Outdoor posters'];
if ($preferred!=='auto'&&$preferred!=='Multi-platform'&&!in_array($preferred,$allowed,true)) reply(422,['success'=>false,'message'=>'Unsupported advertising channel.']);
$tz=new DateTimeZone('Africa/Dar_es_Salaam'); $date=DateTimeImmutable::createFromFormat('!Y-m-d',$start,$tz); $errors=DateTimeImmutable::getLastErrors();
if (!$date||($errors!==false&&($errors['warning_count']||$errors['error_count']))||$date->format('Y-m-d')!==$start) reply(422,['success'=>false,'message'=>'Choose a valid campaign start date.']);
$last=$date->modify('last day of this month'); $dates=[];
for($d=$date;$d<=$last;$d=$d->modify('+1 day')) $dates[]=$d->format('Y-m-d');
$localHint='';
if (preg_match('/\\b(Dar es Salaam|Dodoma|Mbeya|Arusha|Mwanza|Morogoro|Zanzibar|Tanga|Iringa|Kigoma|Tabora|Singida|Shinyanga|Mtwara|Lindi|Njombe|Ruvuma|Kilimanjaro)\\b/i',$notes,$m)) $localHint=$m[1];
$context=$type.' Tanzania'.($localHint!==''?' '.$localHint:'');
$queries=[
 $context.' customers market demand competitors',
 $type.' Tanzania business services and customer market information',
 $type.' marketing channels customers Tanzania social media'
];
$research=[];
foreach($queries as $q) {
    foreach(webSearch($q) as $item) {
        $key=strtolower($item['url']);
        if (!isset($research[$key])) $research[$key]=$item;
        if (count($research)>=12) break 2;
    }
}
$research=array_values($research);
$channels=chooseChannels($type,$offer,$audience,$goal,$preferred);
$searchTerms=strtolower($type.' '.$offer);
$localHint='';
if (preg_match('/\b(Dar es Salaam|Dodoma|Mbeya|Arusha|Mwanza|Morogoro|Zanzibar|Tanga|Iringa|Kigoma|Tabora|Singida|Shinyanga|Mtwara|Lindi|Njombe|Ruvuma|Kilimanjaro)\b/i',$notes,$m)) $localHint=$m[1];
$days=[]; $totalDays=count($dates);
$paidEligible=array_values(array_filter($channels,fn($c)=>in_array($c,['Facebook','Instagram','TikTok','YouTube','LinkedIn'],true)));
$paidCount=($budget>0&&$paidEligible)?min(6,max(1,(int)ceil($totalDays/5))):0;
$paidIndexes=[];
if($paidCount>0) for($i=0;$i<$paidCount;$i++) $paidIndexes[(int)round(($i+1)*$totalDays/($paidCount+1))-1]=true;
$paidAmount=$paidCount?(int)floor($budget/$paidCount):0; $paidRemainder=$paidCount?(int)round($budget-$paidAmount*$paidCount):0;
$anglesSw=['Tambulisha huduma/bidhaa yako kwa picha halisi','Eleza tatizo ambalo bidhaa au huduma hii inasaidia kutatua','Onyesha hatua za kutumia au kupata huduma','Jibu swali ambalo mteja anaweza kuuliza kabla ya kununua','Eleza tofauti muhimu ya bidhaa/huduma yako kwa kutumia taarifa ulizothibitisha','Onyesha nyuma ya pazia: maandalizi au namna unavyofanya kazi','Shirikisha maoni halisi ya mteja ikiwa unayo','Toa mwaliko wa kuwasiliana au kutembelea biashara'];
$anglesEn=['Introduce the exact product or service with a real photo','Explain the customer need this offer addresses','Show how the product or service works','Answer a question customers may ask before buying','Explain a verified feature or useful difference','Show a behind-the-scenes view of the work','Share genuine customer feedback only if you have permission and evidence','Invite people to contact or visit the business'];
$formatPool=['Photo post','Short vertical video','Carousel / multi-image post','Story / status sequence','FAQ graphic','Demonstration video','Customer question post','Direct-response post'];
foreach($dates as $i=>$dayDate) {
    $channel=$channels[$i%count($channels)];
    if ($preferred!=='auto'&&$preferred!=='Multi-platform') $channel=$preferred;
    $angle=$lang==='Swahili'?$anglesSw[$i%count($anglesSw)]:$anglesEn[$i%count($anglesEn)];
    $paid=isset($paidIndexes[$i])&&$paidCount>0;
    $amount=$paid?($paidAmount+($i===array_key_first($paidIndexes)?$paidRemainder:0)):0;
    $dow=(int)(new DateTimeImmutable($dayDate,$tz))->format('N');
    $time=$channel==='WhatsApp Status'?'07:30':(($channel==='TikTok'||$channel==='Instagram')?'19:00':($dow>=6?'10:00':'18:00'));
    $task=($lang==='Swahili'?'Tengeneza ':'Create ').$formatPool[$i%count($formatPool)].': '.$angle.'. '.($lang==='Swahili'?'Tumia picha/video halisi ya biashara na taarifa ulizothibitisha.':'Use a real business photo/video and only verified details.');
    $caption=buildCaption($lang,$name,$offer,$angle,$notes,$goal);
    $days[]=['date'=>$dayDate,'channel'=>$channel,'time'=>$time,'paid'=>$paid,'budget'=>$amount,'format'=>$formatPool[$i%count($formatPool)],'task'=>$task,'caption'=>$caption,'objective'=>$goal,'rationale'=>$lang==='Swahili'?'Mpangilio unatokana na lengo, aina ya biashara na taarifa za utafiti zilizopatikana.':'Scheduled from the stated business, goal and available research signals.'];
}
$allocated=array_sum(array_column($days,'budget'));
$summary=$lang==='Swahili'?'Mpango wa '.$name.' umeandaliwa kwa kutumia taarifa ulizoweka pamoja na '.count($research).' matokeo ya utafutaji wa umma.':'A campaign plan for '.$name.' was built from your inputs and '.count($research).' public web search results.';
$strategy=$lang==='Swahili'?'Anza kwa kuonyesha bidhaa/huduma halisi, toa maelezo yanayojibu maswali ya wateja, kisha waalike kuchukua hatua. Hakuna bei, ushuhuda au takwimu zilizobuniwa.':'Lead with the actual offer, answer customer questions with verified information, then use clear calls to action. No prices, testimonials or performance figures have been invented.';
if ($research===[]) $strategy.=$lang==='Swahili'?' Utafutaji wa mtandaoni haukupatikana wakati wa ombi hili; ratiba imetegemea taarifa za mteja na kanuni za kupanga matangazo.':' Live web search was unavailable for this request; the schedule therefore relies on customer inputs and transparent planning rules.';
reply(200,['success'=>true,'plan'=>['summary'=>$summary,'strategy'=>$strategy,'days'=>$days,'research'=>['status'=>$research?'available':'unavailable','queries'=>$queries,'sources'=>$research,'local_context'=>$localHint,'result_count'=>count($research)],'budget'=>['monthly_total_tzs'=>$budget,'allocated_to_paid_tzs'=>$allocated,'paid_days'=>$paidCount,'unallocated_tzs'=>max(0,$budget-$allocated)],'generated_by'=>'PRIMONIZER rules + public web research']]);
