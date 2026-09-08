// --- CONFIGURATION ---
const COUNTING_CHANNELS = {
  'disabled': { mode: 'standard' },
  'disabled': { mode: 'binary' }
};

// Isolated state container for each channel
const channelStates = {};

// Initialize state for each registered channel
for (const channelId of Object.keys(COUNTING_CHANNELS)) {
  channelStates[channelId] = {
    currentCount: 0,
    lastUserId: null
  };
}

// Exported using ES Module syntax
export async function handleMessage(message) {
  if (message.author.bot) return;

  const channelConfig = COUNTING_CHANNELS[message.channel.id];
  if (!channelConfig) return; // Not a counting channel

  const state = channelStates[message.channel.id];

  if (channelConfig.mode === 'standard') {
    await handleStandard(message, state);
  } else if (channelConfig.mode === 'binary') {
    await handleBinary(message, state);
  }
}

async function handleStandard(message, state) {
  const content = message.content.trim();
  const userNumber = parseInt(content, 10);

  // Zero-Tolerance: Non-integer message sent in counting channel
  if (isNaN(userNumber) || userNumber.toString() !== content) {
    await message.react('❌');
    await message.channel.send(
      `❌ Zero-tolerance rule! <@${message.author.id}> sent invalid text ("${content}"). Count reset to **0**. Next number is **1**.`
    );
    resetState(state);
    return;
  }

  // Zero-Tolerance: Double-counting by same user
  if (message.author.id === state.lastUserId) {
    await message.react('❌');
    await message.channel.send(
      `❌ Zero-tolerance rule! <@${message.author.id}>, you cannot count twice in a row! Count reset to **0**. Next number is **1**.`
    );
    resetState(state);
    return;
  }

  const expectedNumber = state.currentCount + 1;

  // Zero-Tolerance: Wrong count sequence
  if (userNumber !== expectedNumber) {
    await message.react('❌');
    await message.channel.send(
      `❌ Wrong number! <@${message.author.id}> typed **${userNumber}**, but expected **${expectedNumber}**. Count reset to **0**. Next number is **1**.`
    );
    resetState(state);
    return;
  }

  // Valid step
  state.currentCount = expectedNumber;
  state.lastUserId = message.author.id;
  await message.react('✅');
}

async function handleBinary(message, state) {
  const content = message.content.trim();

  // Zero-Tolerance: Must consist exclusively of binary 0s and 1s
  if (!/^[01]+$/.test(content)) {
    await message.react('❌');
    await message.channel.send(
      `❌ Zero-tolerance rule! <@${message.author.id}> sent invalid binary ("${content}"). Count reset to **0**. Next binary is **1**.`
    );
    resetState(state);
    return;
  }

  // Zero-Tolerance: Double-counting by same user
  if (message.author.id === state.lastUserId) {
    await message.react('❌');
    await message.channel.send(
      `❌ Zero-tolerance rule! <@${message.author.id}>, you cannot count twice in a row! Binary count reset to **0**. Next binary is **1**.`
    );
    resetState(state);
    return;
  }

  const userNumber = parseInt(content, 2);
  const expectedNumber = state.currentCount + 1;
  const expectedBinary = expectedNumber.toString(2);

  // Zero-Tolerance: Wrong binary sequence
  if (userNumber !== expectedNumber) {
    await message.react('❌');
    await message.channel.send(
      `❌ Wrong binary number! <@${message.author.id}> typed **${content}**, but expected **${expectedBinary}** (${expectedNumber}). Binary count reset to **0**. Next binary is **1**.`
    );
    resetState(state);
    return;
  }

  // Valid step
  state.currentCount = expectedNumber;
  state.lastUserId = message.author.id;
  await message.react('✅');
}

function resetState(state) {
  state.currentCount = 0;
  state.lastUserId = null;
}
