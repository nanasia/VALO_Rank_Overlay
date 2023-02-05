let Regiao = "ap";					//eu na ap(jp) kr
let Username = "君にリコン届け";	//名前
let Tagline = "774A";				//タグライン
//上3行を自分のアカウントに合わせて変更する
//アカウント情報を変更したらこちらも変更してください

let rankcurrent;			//現在のランク
let rankcurrent_nospace;	//現在のランクの空白なし
let rankcurrent_nonum;		//現在のランクの数字なし(レディアントは最後のtなし)

let rankpt;			//現在のランクpt
let rankpt2 = 0;;			//現在のランクpt記録用

let rankpt_meter;	//現在のランクpt(メーター用)
let rankpt_str;		//現在のランク + "pt"
let resize;			//メーターの変更後の長さ

let lastmutchdate;		//前回のコンペマッチの日付
let lastmutchdate2;		//前回のコンペマッチの日付記録用
let changerankpt;		//前回のコンペマッチのpt変動

let drowflag = false;	//引き分けフラグ
let vdflag = false;		//勝敗フラグ
let myteam;				//自分のチーム
let totalwin = 0;		//今回の勝利数
let totallose = 0;		//今回の敗北数

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
	//Get MMR History
	let GetMMRHistory = InfoGet(
		"https://api.henrikdev.xyz/valorant/v1/mmr-history/" +
		Regiao + "/" + Username + "/" + Tagline
	);
	
	let jsonData = JSON.parse(GetMMRHistory);
	rankcurrent = jsonData.data[0].currenttierpatched;
	rankpt = jsonData.data[0].ranking_in_tier;
	changerankpt = jsonData.data[0].mmr_change_to_last_game;
	lastmutchdate = jsonData.data[0].date;
	
	//画像の処理
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
	
	resize = rankpt_meter * 6.25;
	rpmeterW.width = resize;
	
	//現在のRP表示の処理
	rankpt_str = rankpt + "pt";
	
	//前のマッチの記録がないならdateを記録
	if(lastmutchdate2 === void 0) {
		lastmutchdate2 = lastmutchdate;
	}
	
	//前のマッチの記録が更新されれば処理実行
	if(lastmutchdate != lastmutchdate2 ) {
		
		//負けて床ペロしたときにマイナスが減った分のみtotalに加算される
		if(changerankpt < 0 && Math.abs(changerankpt) > rankpt2){
			changerankpt = rankpt2 * -1
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
		
		//今回の勝敗数とポイント増減表示の処理
		//Get Match History
		let GetMatchHistory = InfoGet(
			"https://api.henrikdev.xyz/valorant/v3/matches/" +
			Regiao + "/" + Username + "/" +
			Tagline + "?filter=competitive&size=1"
		);
		let jsonDataWL = JSON.parse(GetMatchHistory);
		
		//自分のチームがどっちか
		let playerinfo = jsonDataWL.data[0].players.all_players.find(a => a.name === Username);
		myteam = playerinfo.team;
		
		//勝敗を判断
		vdflag = jsonDataWL.data[0].teams[myteam.toLowerCase()].has_won;
		
		//引き分け判定
		if(jsonDataWL.data[0].teams.red.has_won == false && jsonDataWL.data[0].teams.blue.has_won == false){
			drowflag = true;
		} else {
			drowflag = false;
		}
		
		//勝敗数を追加
		if(vdflag === true){
			totalwin += 1;
		} else if(vdflag === false && drowflag === false){
			totallose += 1;
		}
		
		//マッチのdateを記録
		lastmutchdate2 = lastmutchdate;

		//前のrankptを記録する
		rankpt2 = rankpt;
	}

	//今回の勝敗数とポイント増減を変数に入れる
	text2 = totalwin + " Win / " + totallose + " Lose / Total " + totalptsign + "pt";
	
	//表示の変更
	document.getElementById("rankimg").src = "img/rankmark/" + rankcurrent_nospace + ".png";
	document.getElementById("meter1").src = "img/" + rankcurrent_nonum + ".png";
	document.getElementById("underline").src = "img/UnderLine.png";
	
	document.getElementById("text1_rank").innerHTML = rankcurrent;
	document.getElementById('text1_pt').innerHTML = rankpt_str;
	document.getElementById('text2_total').innerHTML = text2;
}

//20秒に1回mainを起動（API配布先に迷惑がかかるので20秒未満に変更しないでください）
//1000で1秒、20000で20秒です
setInterval(main, 20000);

//最初用
window.onload = function() {
	main();
	rankpt2 = rankpt;
}