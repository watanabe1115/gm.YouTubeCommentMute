// ==UserScript==
// @name         YouTubeCommentMute
// @namespace    https://github.com/watanabe1115/GreasemonkeyScripts/
// @version      1.0.1
// @description  youtubeのコメントをミュートする
// @author       watanabe1115
// @match        https://www.youtube.com/watch*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
var blockChannelList = [];

const BLOCK_CHANNEL_LIST = "BLOCK_CHANNEL_LIST";

const isDebug = false;
const isSilentMute = false;

/**
 * 指定されたコメントNodeをMute状態に書き換える
 * @param node コメント一つのNode(ytd-comment-rendererタグ)
 */
function mute(node) {
	if(isDebug) {
		var channelUrl = node.querySelector("#author-thumbnail > a").href;
		console.log("##### HIT!!!!! #####");
		console.log("mute : " + channelUrl);
	}

	if(isSilentMute) {
		node.hidden = true;
	} else {
		node.querySelector("#author-text").hidden = true;
		var authorSpan = document.createElement("span");
		authorSpan.id = "ycm-author-text-mute";
		authorSpan.style = "color: gray; font-style: italic;";
		authorSpan.innerText = "ミュートしました";
		node.querySelector("#header-author").prepend(authorSpan);

		node.querySelector("#content-text").hidden = true;
		var contentSpan = document.createElement("span");
		contentSpan.id = "ycm-content-text-mute";
		contentSpan.style = "color: gray; font-style: italic;";
		contentSpan.innerText = "ミュートしました";
		node.querySelector("#content").append(contentSpan);
	}
}

/**
 * 指定されたコメントNodeのミュートを解除する
 * @param node コメント一つのNode(ytd-comment-rendererタグ)
 */
function unmute(node) {
	node.querySelector("#ycm-author-text-mute").remove();
	node.querySelector("#ycm-content-text-mute").remove();
	node.querySelector("#author-text").hidden = false;
	node.querySelector("#content-text").hidden = false;
}

/**
 * 指定されたYoutubeチャンネルURLをミュートリストに追加する
 * @param channelUrl チャンネルURL
 */
function addMuteChannel(channelUrl) {
	if(isDebug) {
		console.log("add mute channel : " + channelUrl);
	}

	blockChannelList.push(channelUrl);
	GM_setValue(BLOCK_CHANNEL_LIST, JSON.stringify(blockChannelList));
}

/**
 * 指定されたYoutubeチャンネルURLをミュートリストから取り除く
 * @param channelUrl チャンネルURL
 */
function removeMuteChannel(channelUrl) {
	if(isDebug) {
		console.log("remove mute channel : " + channelUrl);
	}

	blockChannelList = blockChannelList.filter(x => x !== channelUrl);
	GM_setValue(BLOCK_CHANNEL_LIST, JSON.stringify(blockChannelList));
}

/**
 * 「ミュートする」のリンクElementを作成
 * @param node コメント一つのNode(ytd-comment-rendererタグ)
 */
function createMuteEnableButtonElement(node) {
	var channelUrl = node.querySelector("#author-thumbnail > a").href;
	var commentHeader = node.querySelector("#header > #header-author");
	var span = document.createElement("span");
	span.id = "ycm-mute-link";
	span.innerText = "ミュートする";
	span.style = "color: grey; margin-left: 10px; font-size: 8px;";
	span.addEventListener('click', function() {
		if(window.confirm('このユーザーをミュートします')) {
			deleteMuteButtonElement(node);
			addMuteChannel(channelUrl);
			mute(node);
			createMuteDisableButtonElement(node);
		}
	});
	commentHeader.append(span);
}

/**
 * 「ミュート解除」のリンクElementを作成
 * @param node コメント一つのNode(ytd-comment-rendererタグ)
 */
function createMuteDisableButtonElement(node) {
	var channelUrl = node.querySelector("#author-thumbnail > a").href;
	var commentHeader = node.querySelector("#header > #header-author");
	var span = document.createElement("span");
	span.id = "ycm-mute-link";
	span.innerText = "ミュート解除";
	span.style = "color: grey; margin-left: 10px; font-size: 8px;";
	span.addEventListener('click', function() {
		if(window.confirm('このユーザーのミュートを解除します')) {
			deleteMuteButtonElement(node);
			removeMuteChannel(channelUrl);
			unmute(node);
			createMuteEnableButtonElement(node);
		}
	});
	commentHeader.append(span);
}

/**
 * ミュートリンクのElementを削除
 * @param node コメント一つのNode(ytd-comment-rendererタグ)
 */
function deleteMuteButtonElement(node) {
	node.querySelector("#ycm-mute-link").remove();
}


/**
 * Onloadで処理する
 */
window.addEventListener('load', (function(){

	// コメントを監視
	var commentObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (!mutation.addedNodes) return

			for (var i = 0; i < mutation.addedNodes.length; i++) {
				var node = mutation.addedNodes[i];

				if(node.tagName == "YTD-COMMENT-RENDERER") {
					var channelUrl = node.querySelector("#author-thumbnail > a").href;
					if(blockChannelList.includes(channelUrl)) {
						mute(node);
						// 「ミュート解除」リンクを追加
						createMuteDisableButtonElement(node);
					} else {
						// 「ミュートする」リンクを追加
						createMuteEnableButtonElement(node);
					}
				}
			}
		})
	})

	var intervalId = setInterval(function() {
		var commentElement = document.getElementsByTagName("ytd-comments")[0];
		if(commentElement) {
			if(isDebug) {
				console.log("##### 監視開始 #####");
			}

			clearInterval(intervalId);
			commentObserver.observe(commentElement, {
				childList: true,
				subtree: true,
				attributes: false,
				characterData: false
			});
		} else {
			if(isDebug) {
				console.log("##### element検索中... #####");
			}
		}
	}, 1000);
})(),
false);


(function() {
	'use strict';

	// Your code here...
	blockChannelList = JSON.parse(GM_getValue(BLOCK_CHANNEL_LIST, []));
})();