const { App } = require('@slack/bolt');
const config = require('config.json');
const { token, appToken } = config.isProduction ? config.slack_production : config.slack;
const db = require('./db');
module.exports = slack = new App({
  token: token,
  socketMode: true,
  appToken: appToken
});

(async () => {
  // Start your app
  await slack.start(3022);
  console.log('===Slackapp is running!====');
})();

function addViewBlockRow(blocks) {
  let currentNo = 0;
  blocks.forEach(element => {
    if(element["element"] && element["element"]["action_id"] == "act_role") {
      currentNo ++;
    }
  });
  const oneRowArr = [
    {
      "type": "divider"
    },
    {
      "type": "input",
      "block_id": `est_${currentNo}_role`,
      "element": {
        "type": "plain_text_input",
        "action_id": "act_role"
      },
      "label": {
        "type": "plain_text",
        "text": "Role",
        "emoji": true
      }
    },
    {
      "type": "input",
      "block_id": `est_${currentNo}_tasks`,
      "element": {
        "type": "plain_text_input",
        "action_id": "act_tasks"
      },
      "label": {
        "type": "plain_text",
        "text": "Task(s)",
        "emoji": true
      }
    },
    {
      "type": "input",
      "block_id": `est_${currentNo}_hours`,
      "element": {
        "type": "number_input",
        "is_decimal_allowed": false,
        "action_id": "act_hours"
      },
      "label": {
        "type": "plain_text",
        "text": "Estimated Hours",
        "emoji": true
      }
    }
  ];

  for (let i = 0; i < oneRowArr.length; i++) {
    blocks.splice(blocks.length - 2, 0, oneRowArr[i]);
  }

  return blocks;
}

slack.command('/sow', async ({ ack, body, client, logger }) => {
  await ack();
  console.log("Sowbody====>", body)
  try {
    const join = await client.conversations.join({channel: body.channel_id})
    console.log("join====>", join)
  } catch (error) {
    logger.error(error);
  }
  
  const grant = await db.Grant.findOne({ where: { slack_id: body.user_id, status:1} });
  if(!grant) {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Streamlined SOW'
        },
        close: {
          "type": "plain_text",
          "text": "Close",
          "emoji": true
        },
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": "You don't have SOW access permission. Please ask to your admin",
              "emoji": true
            }
          }
        ]
      }
    });
    return;
  }
  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Streamlined SOW'
        },
        blocks: [
          {
            "type": "input",
            "block_id": "projectName",
            "element": {
              "type": "plain_text_input",
              "action_id": "act_pname"
            },
            "label": {
              "type": "plain_text",
              "text": "Project Name",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "acceptors",
            "element": {
              "type": "multi_users_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Write @",
                "emoji": true
              },
              "action_id": "act_users"
            },
            "label": {
              "type": "plain_text",
              "text": "Stakeholder(s) who can approve or deny",
              "emoji": true
            }
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Team estimates",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "block_id": "est_0_role",
            "element": {
              "type": "plain_text_input",
              "action_id": "act_role"
            },
            "label": {
              "type": "plain_text",
              "text": "Role",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "est_0_tasks",
            "element": {
              "type": "plain_text_input",
              "action_id": "act_tasks"
            },
            "label": {
              "type": "plain_text",
              "text": "Task(s)",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "est_0_hours",
            "element": {
              "type": "number_input",
              "is_decimal_allowed": false,
              "action_id": "act_hours"
            },
            "label": {
              "type": "plain_text",
              "text": "Estimated Hours",
              "emoji": true
            }
          },
          {
            "type": "divider",
          },
          {
            "type": "actions",
            "block_id": "add_row_1",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "+ ADD ROW",
                  "emoji": true
                },
                "value": `${body.channel_id}`,
                "action_id": "action-addrow"
              }
            ]
          }

        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    // logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

slack.action('action-addrow', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    if (body.type !== 'block_actions' || !body.view) {
      return;
    }
    const result = await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: body.view.type,
        // View identifier
        callback_id: body.view.callback_id,
        title: body.view.title,
        blocks: addViewBlockRow(body.view.blocks),
        submit: body.view.submit
      }
    });
    // logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

slack.view('view_1', async ({ ack, body, view, client, logger }) => {
  await ack();
  const values = view['state']['values'];
  let estimates = [], curNo = 'N', oneEst = {};
  for (const key in values) {
    if(key.includes('est_')) {
      estimates[key.split("_")[1]];
      if(!estimates[key.split("_")[1]]) estimates[key.split("_")[1]] = {};
      estimates[key.split("_")[1]]

      if(key.includes('_role')) estimates[key.split("_")[1]].role = values[key]['act_role']['value'];
      if(key.includes('_tasks')) estimates[key.split("_")[1]].tasks= values[key]['act_tasks']['value'];
      if(key.includes('_hours')) estimates[key.split("_")[1]].hours= values[key]['act_hours']['value'];
    }
  }
  
  const payload = {
    projectName: view['state']['values']['projectName']['act_pname']['value'],
    acceptors: view['state']['values']['acceptors']['act_users']['selected_users'],
    estimates: estimates
  }
  let milestonListTxt = "", totalHours = 0;
  payload.estimates.forEach(est => {
    milestonListTxt +=`• ${est.hours} hours: ${est.role} - ${est.tasks} \n`;
    totalHours += Number(est.hours);
  });
  
  console.log("payload====>", payload);
  // Save to DB
  const proposal = await db.Proposal.create({
    slackId: body.view.id,
    name: payload.projectName,
    creator: body.user.id,
    acceptor: payload.acceptors[0], // only one user at the moment, it will change...
  });
  if(proposal) {
    payload.estimates.forEach(element => {
      element.proposalId = proposal.id
    });
    await db.ProposalContent.bulkCreate(payload.estimates);
  }
  // view['state']['values']['add_row']['action-addrow']['value']
  const blocks = view['blocks'];
  //
  try {
    if(blocks[blocks.length - 1]['elements'][0]['value']) {
      let acceptors = "";
      payload.acceptors.forEach(user => {
        acceptors += `<@${user}> `
        client.chat.postMessage({
          channel: user,
          text: "Please check the estimate",
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `<@${body.user.id}> sent you an estimate:`
              }
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `We estimate that your *${payload.projectName}* will take *${totalHours} hours*  with the following team contributions:`
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": milestonListTxt,
                "emoji": true
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "Do you approve our estimates? If so, please click 'Approve' and we will begin working. If not, please click 'Deny' and let us know how we can serve you better.",
                "emoji": true
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "Deny"
                  },
                  "value": `${body.view.id}__${body.user.id}__${blocks[blocks.length - 1]['elements'][0]['value']}`,
                  "style": "danger",
                  "action_id": "act_deny"
                },
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "Approve"
                  },
                  "style": "primary",
                  "value": `${body.view.id}__${body.user.id}__${blocks[blocks.length - 1]['elements'][0]['value']}`,
                  "action_id": "act_approve"
                }
              ]
            }
          ]
        });
      });

      client.chat.postMessage({
        channel: blocks[blocks.length - 1]['elements'][0]['value'],
        text: "Requested Estimate",
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `<@${body.user.id}> sent an estimate to ${acceptors}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `We estimate that your *${payload.projectName}* will take *${totalHours} hours*  with the following team contributions:`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": milestonListTxt,
              "emoji": true
            }
          }
        ]
      })
    } else {
      slackViewNotify(client, body, `Please try on channel`)
    }
    
  }
  catch (error) {
    logger.error(error);
  }
});

slack.action('act_approve', async ({ ack, body, client, logger, say }) => {
  await ack();
  const slackId = body.actions[0]["value"].split("__")[0];
  const poster = body.actions[0]["value"].split("__")[1];
  const channel = body.actions[0]["value"].split("__")[2];
  let estimate = `${body["message"]["blocks"][1]["text"]["text"]}\n${body["message"]["blocks"][2]["text"]["text"]}`;
  estimate = estimate.split("\n").join("\n>");

  const proposal = await db.Proposal.findOne({ where: { slackId: slackId, acceptor: body.user.id} });
  if(proposal) {
    if(proposal.status == 1) {
      slackViewNotify(client, body, `You've already approved the estimate`)
    } else if(proposal.status == -1) {
      slackViewNotify(client, body, `You've already denied the estimate`)
    } else if(proposal.status == null) {
      const result = await db.Proposal.update(
        {status: 1, acceptor: body.user.id},
        { where: { id: proposal.id } }
      );
      if(result && result[0]) {
        await say({
          text: `You have approved this estimate. Please discuss the estimate with <@${poster}>` // *#${body.actions[0]["value"]}*
        });
        // post to channel
        client.chat.postMessage({
          channel: channel,
          text: `<@${body.user.id}> has approved this estimate.`,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `<@${body.user.id}> has approved this estimate:\n>${estimate}`
              }
            }
          ]
        })
      } else {
        await say({
          text: `Something wrong, please try again`
        });
      }
    }
  } else {
    slackViewNotify(client, body, `You don't have a permission for this proposal.`)
  }
});

slack.action('act_deny', async ({ ack, body, client, logger, say }) => {
  await ack();
  const slackId = body.actions[0]["value"].split("__")[0];
  const poster = body.actions[0]["value"].split("__")[1];
  const channel = body.actions[0]["value"].split("__")[2];
  let estimate = `${body["message"]["blocks"][1]["text"]["text"]}\n${body["message"]["blocks"][2]["text"]["text"]}`;
  estimate = estimate.split("\n").join("\n>");

  const proposal = await db.Proposal.findOne({ where: { slackId: slackId, acceptor: body.user.id} });
  if(proposal) {
    if(proposal.status == 1) {
      slackViewNotify(client, body, `You've already approved the estimate`)
    } else if(proposal.status == -1) {
      slackViewNotify(client, body, `You've already denied the estimate`)
    } else if(proposal.status == null) {
      const result = await db.Proposal.update(
        {status: -1, acceptor: body.user.id},
        { where: { id: proposal.id } }
      );
      if(result && result[0]) {
        await say({
          text: `You have denied this estimage. Please discuss the estimate with <@${poster}>`
        });
        // post to channel
        client.chat.postMessage({
          channel: channel,
          text: `<@${body.user.id}> has denied the estimate.`,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `<@${body.user.id}> has denied the estimate:\n>${estimate}`
              }
            }
          ]
        })
      } else {
        await say({
          text: `Something wrong, please try again`
        });
      }
    }
  } else {
    slackViewNotify(client, body, `You don't have a permission for this proposal.`)
  }
});

async function slackViewNotify(client, body, text) {
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'view_notify',
      title: {
        type: 'plain_text',
        text: 'Info'
      },
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": text,
            "emoji": true
          }
        }
      ]
    }
  })
}

