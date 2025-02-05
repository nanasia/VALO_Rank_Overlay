let Regiao = "ap";					//eu na ap(jp) kr
let Username = "7 tear Twitch";	//名前
let Tagline = "774A";				//タグライン
let Apikey = "HDEV-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"	//API_KEY
//上4行を自分のアカウントに合わせて変更する
//アカウント情報を変更したらこちらも変更してください

let priflag = true;			//表示の変更を反映するかのフラグ
let Username2;				//名前に空白がある場合の名前

let rankcurrent;			//現在のランク
let rankcurrent_nospace;	//現在のランクの空白なし
let rankcurrent_nonum;		//現在のランクの数字なし(レディアントは最後のtなし)
let currenttier;			//現在のランクの下からの順番
let lastcurrenttier;		//前回の現在のランクの下からの順番

let rankpt;					//現在のランクpt
let lastrankpt = 0;			//現在のランクpt記録用

let lastmutchdate;			//前回のコンペマッチの日付
let lastmutchdate2;			//前回のコンペマッチの日付記録用
let lastchangerankpt;		//前回のコンペマッチのpt変動
let lastmutchdateGMH;		//前回のコンペマッチの日付(GMH)
let lastmutchdateGMH2;		//前回のコンペマッチの日付記録用(GMH)

let rankpt_meter;		//現在のランクpt(メーター用)
let resize;				//メーターの変更後の長さ

let drowflag = false;	//引き分けフラグ
let wlflag = false;		//勝敗フラグ
let myteam;				//自分のチーム
let totalwin = 0;		//今回の勝利数
let totallose = 0;		//今回の敗北数

let changerankpt;		//Totalに加算するpt
let totalpt = 0;		//今回のpt増減
let totalpt_sign;		//totalptの+-判定用
let totalptsign = 0;	//totalptの符号付き

let text2;	//今回の勝敗数とポイント増減表示用

function InfoGet(url) {
  let request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.send();
  return request.responseText;
}

function main() {
	Username2 = Username.replace( " ", "%20" );

	//Get MMR History
	let GetMMRHistory = InfoGet(
		"https://api.henrikdev.xyz/valorant/v1/mmr-history/" +
		Regiao + "/" + Username2 + "/" + Tagline + "?api_key=" + Apikey
	);
	
	let jsonData = JSON.parse(GetMMRHistory);
	currenttier = jsonData.data[0].currenttier;
	rankcurrent = jsonData.data[0].currenttierpatched;
	rankpt = jsonData.data[0].ranking_in_tier;
	lastchangerankpt = jsonData.data[0].mmr_change_to_last_game;
	lastmutchdate = jsonData.data[0].date;
	
	//画像の処理のための変数を用意
	rankcurrent_nospace = rankcurrent.replace(/\s+/g, "");
	rankcurrent_nonum = rankcurrent_nospace.slice( 0, -1);
	
	//メーター増減の処理
	let rpmeterW = document.getElementById('meter1');
	
	//rankptをメーター用の変数にコピー
	rankpt_meter = rankpt;
	
	//芋とかRP100以上だとメーターを100にする
	if(rankpt_meter > 100 ) {
		rankpt_meter = 100;
	}
	
	//メーターの長さ調整
	resize = rankpt_meter * 6.25;
	
	//前のマッチの記録がないならdateを記録
	if(lastmutchdate2 === void 0) {
		lastmutchdate2 = lastmutchdate;
	}
	
	//前のマッチの記録が更新されれば処理実行
	if(lastmutchdate != lastmutchdate2) {
		
		//APIの情報更新タイミングが異なった時は表示を更新しないようにする
		priflag = false;
		
		//今回の勝敗数とポイント増減表示の処理
		//Get Match History
		let GetMatchHistory = InfoGet(
			"https://api.henrikdev.xyz/valorant/v3/matches/" +
			Regiao + "/" + Username2 + "/" +
			Tagline + "?filter=competitive&size=1" + "&api_key=" + Apikey
		);
		let jsonDataWL = JSON.parse(GetMatchHistory);
		lastmutchdateGMH = jsonDataWL.data[0].metadata.game_start_patched;
		
		//Get Match Historyも更新されたら処理を開始する
		if (lastmutchdateGMH != lastmutchdateGMH2) {
			//totalに加算する用の変数に変動したランクptを入れる
			changerankpt = lastchangerankpt;
			
			//床ペロしたときに減った分のみtotalにマイナスが加算される
			if(lastchangerankpt < 0 && Math.abs(lastchangerankpt) > lastrankpt && lastrankpt != 0){
				changerankpt = lastrankpt * -1;
			}
			
			//アイアン1で床ペロの時、Totalに加算する値を0にする
			if(rankcurrent == "Iron 1" && lastrankpt == 0){
				changerankpt = 0;
			}
			
			//イモ2未満かつランク昇格時かつ昇格後のポイントが10未満な場合に10になるため、Totalに追加するptの調整
			if(currenttier < 25 && lastcurrenttier < currenttier && lastrankpt + lastchangerankpt < 110){
				changerankpt = changerankpt + 110 - lastrankpt - lastchangerankpt;
			}
			
			//totalptを増減
			totalpt += changerankpt;
			
			//pt合計の符号が何か判定
			totalpt_sign = Math.sign(totalpt);
			
			//合計が＋符号なら符号をつける
			if (0 < totalpt_sign) {
				totalptsign = "+" + totalpt;
			} else {
				totalptsign = totalpt;
			}
			
			//自分のチームがどっちか
			let playerinfo = jsonDataWL.data[0].players.all_players.find(a => a.name === Username);
			myteam = playerinfo.team;
			
			//勝敗を判断
			wlflag = jsonDataWL.data[0].teams[myteam.toLowerCase()].has_won;
			
			//引き分け判定
			if(jsonDataWL.data[0].teams.red.has_won == false && jsonDataWL.data[0].teams.blue.has_won == false){
				drowflag = true;
			} else {
				drowflag = false;
			}
			
			//勝敗数を追加
			if(wlflag === true){
				totalwin += 1;
			} else if(wlflag === false && drowflag === false){
				totallose += 1;
			}
			
			//マッチのdateを記録
			lastmutchdate2 = lastmutchdate;
			lastmutchdateGMH2 = lastmutchdateGMH;
			
			//前のrankptを記録する
			lastrankpt = rankpt;
			
			//前のrankcurrentを記録する
			lastcurrenttier = currenttier;
			
			//表示更新のタイミング合わせ
			priflag = true;
		}
	}
	
	//今回の勝敗数とポイント増減を変数に入れる
	text2 = totalwin + " Win " + totallose + " Lose / Total " + totalptsign + "pt";
	
	//表示の変更
	//表示の変更をしていいなら変更
	if (priflag === true){
		
		//メーター反映
		rpmeterW.width = resize;
		//ランクマーク
		document.getElementById("rankimg").src = "img/rankmark/" + rankcurrent_nospace + ".png";
		//メーターの色
		document.getElementById("meter1").src = "img/" + rankcurrent_nonum + ".png";
		//線みたいなの
		document.getElementById("underline").src = "img/Underline.png";
		//背景
		document.getElementById("background").src = "img/Background.png";
		//現ランク
		document.getElementById("text1_rank").innerHTML = rankcurrent;
		//現ランクのポイント
		document.getElementById('text1_pt').innerHTML = rankpt + "pt";
		//下側のテキスト
		document.getElementById('text2_total').innerHTML = text2;
	}
}

//20秒に1回mainを起動（API配布先に迷惑がかかるので20秒未満に変更しないでください）
//1000で1秒、20000で20秒です
setInterval(main, 20000);

//最初用
window.onload = function() {
	main();
	lastrankpt = rankpt;
	
	//前の試合の日付を記録する
	//Get Match History
	let GetMatchHistory = InfoGet(
		"https://api.henrikdev.xyz/valorant/v3/matches/" +
		Regiao + "/" + Username + "/" +
		Tagline + "?filter=competitive&size=1" + "&api_key=" + Apikey
	);
	let jsonDataWL = JSON.parse(GetMatchHistory);
	lastmutchdateGMH = jsonDataWL.data[0].metadata.game_start_patched;
	
	lastmutchdateGMH2 = lastmutchdateGMH;
	lastcurrenttier = currenttier;
}
