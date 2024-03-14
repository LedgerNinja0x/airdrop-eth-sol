import axios from "axios";

export default async function handler(req, res) {
  try {
    //this is a POST route /api/me/verify
    //takes in message,hashtags,username and url from req.body
    //uses twitter graphql and cookies to fetch that particular tweet in the url
    //checks if the content in the tweet includes message and hastags
    //If yes then updates the user document(username) => set twitterVerified: true and return a 201 response else 400
    const { message, hashtags, username, url } = req.body;
    if (!message || !hashtags || !username || !url) {
      return res.status(401).send("body missing");
    }

    let arr = url.split("/");
    let id = arr[arr.length - 1];
    console.log(id);

    if (!id) {
      return res.status(401).send("Wrong url format");
    }

    //get the tweet from url
    let resp = await fetch(
      `https://twitter.com/i/api/graphql/ZkD-1KkxjcrLKp60DPY_dQ/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${id}%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%7D`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
          authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "content-type": "application/json",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-client-transaction-id":
            "gbjhHudn6hT6/8TZnbQnsDvDvqd1ZycXUG97vmKXhX+4bY23yRP2ET6jG0/EbIrmDXXeIoCegoAZBLt97f1IM65hGyRRgA",
          "x-csrf-token":
            "4b9b04a8193f7f0711abd88525eb32eb91df5c33e5e2db4bc67c0453cadc064e3d2195df8f262ea0abd91181837a19ee2e7847b7d9bbf9e0134df46e2d1d0ac91e8f92943d0ffa11232008f6ca55f201",
          "x-twitter-active-user": "yes",
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-client-language": "en",
          cookie:
            '_ga=GA1.2.852147145.1697218874; guest_id=v1%3A169894402932066045; g_state={"i_l":0}; kdt=nSkudtglT5YwouqSoM7uIVTqniJ4ikTRZggVlP1J; auth_token=237200a4140726c82854adfec1cb37e8689b0449; ct0=4b9b04a8193f7f0711abd88525eb32eb91df5c33e5e2db4bc67c0453cadc064e3d2195df8f262ea0abd91181837a19ee2e7847b7d9bbf9e0134df46e2d1d0ac91e8f92943d0ffa11232008f6ca55f201; guest_id_ads=v1%3A169894402932066045; guest_id_marketing=v1%3A169894402932066045; twid=u%3D1685189122506280960; des_opt_in=Y; lang=en; external_referer=padhuUp37zi9oIHrrGN%2FsvseC5OtCL8MQObMib1hMgdj76f1u20EzaC9EjVk%2B5TBaqd8WLT04qATOw6%2BcBmyatv2kZyleb71|0|8e8t2xd8A2w%3D; _gid=GA1.2.1632655944.1710320158; personalization_id="v1_26yVv8oQ+tH2/SzK48H11g=="',
          Referer:
            "https://twitter.com/SaswatSing56185/status/1732298893520498844",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: null,
        method: "GET",
      }
    );

    let { data } = await resp.json();

    let tweet =
      data.threaded_conversation_with_injections_v2.instructions[0].entries[0]
        .content.itemContent.tweet_results.result?.tweet?.legacy?.full_text || data.threaded_conversation_with_injections_v2.instructions[0].entries[0]
        .content.itemContent.tweet_results.result.legacy.full_text;

    console.log(tweet);

    let verified = false;

    hashtags.forEach((tag) => {
      if (!tweet.includes(tag)) {
        verified = false;
        return;
      } else {
        verified = true;
      }
    });

    if (!tweet.includes(message)) {
      verified = false;
    }

    if (verified) {
      await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: "test",
          collection: "users",
          filter: {
            username,
          },
          update: {
            $set: {
              twitterVerified: "yes",
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );
      res.status(201).send("user verified and updated successfully");
    } else {
      res.status(401).send("Tweet doesn't match. Check msg and hashtag carefully.");
    }
  } catch (e) {
    res.status(500).send('Something went wrong')
    console.error(e);
  }
}
