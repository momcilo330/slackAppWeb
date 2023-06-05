const { App } = require('@slack/bolt');
const config = require('config.json');
const { token, appToken } = config.slack;
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
  console.log("--command detected!!!");
  await ack();

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
            "block_id": "approveUsers",
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
            "type": "divider"
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "+ ADD ROW",
                  "emoji": true
                },
                "value": "click_me_123",
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
    approveUsers: view['state']['values']['approveUsers']['act_users']['selected_users'],
    estimates: estimates
  }
  let milestonListTxt = "", totalHours = 0;
  payload.estimates.forEach(est => {
    milestonListTxt +=`• ${est.hours} hours: ${est.role} - ${est.tasks} \n`;
    totalHours += Number(est.hours);
  });
  
  console.log("payload====>", payload);
  // Save to DB
  
  //
  try {
    payload.approveUsers.forEach(user => {
      client.chat.postMessage({
        channel: user,
        text: "Please check the proposal",
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `<@${body.user.id}> sent you a proposal - *#${body.view.id}*:\nWe estimate that your *${payload.projectName}* will take *${totalHours} hours*  with the following team contributions:`
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
                "value": `${body.view.id}`,
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
                "value": `${body.view.id}`,
                "action_id": "act_approve"
              }
            ]
          }
        ]
      });  
    });
  }
  catch (error) {
    logger.error(error);
  }
});

slack.action('act_approve', async ({ ack, body, client, logger, say }) => {
  await ack();
  await say({
    text: `You've approved a proposal *#${body.actions[0]["value"]}*`
  });
});

slack.action('act_deny', async ({ ack, body, client, logger, say }) => {
  await ack();
  await say({
    text: `You've denied a proposal *#${body.actions[0]["value"]}*`
  });
});

