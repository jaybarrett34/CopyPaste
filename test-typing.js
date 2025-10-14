const robot = require('@jitsi/robotjs');

// Test typing simulation
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typeCharacter(char) {
  try {
    console.log(`Typing character: "${char}" (code: ${char.charCodeAt(0)})`);

    if (char === '\n') {
      robot.keyTap('enter');
      console.log(`  ✓ keyTap('enter')`);
      return;
    }

    if (char === '\t') {
      robot.keyTap('tab');
      console.log(`  ✓ keyTap('tab')`);
      return;
    }

    if (char === ' ') {
      robot.keyTap('space');
      console.log(`  ✓ keyTap('space')`);
      return;
    }

    // Map of special characters that need shift
    const shiftChars = {
      '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
      '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
      '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
      ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
    };

    // Map of regular special characters (no shift needed)
    const regularChars = {
      '-': 'minus', '=': 'equal', '[': 'left_bracket', ']': 'right_bracket',
      '\\': 'backslash', ';': 'semicolon', "'": 'quote', ',': 'comma',
      '.': 'period', '/': 'slash', '`': 'backquote'
    };

    // Check if character is uppercase letter
    if (char >= 'A' && char <= 'Z') {
      robot.keyTap(char.toLowerCase(), ['shift']);
      console.log(`  ✓ keyTap('${char.toLowerCase()}', ['shift'])`);
    } else if (char.match(/^[a-z0-9]$/)) {
      robot.keyTap(char);
      console.log(`  ✓ keyTap('${char}')`);
    } else if (shiftChars[char]) {
      robot.keyTap(shiftChars[char], ['shift']);
      console.log(`  ✓ keyTap('${shiftChars[char]}', ['shift']) for "${char}"`);
    } else if (regularChars[char]) {
      robot.keyTap(regularChars[char]);
      console.log(`  ✓ keyTap('${regularChars[char]}') for "${char}"`);
    } else {
      robot.typeString(char);
      console.log(`  ✓ typeString('${char}')`);
    }
  } catch (error) {
    console.error(`  ✗✗ Error typing character "${char}":`, error.message);
  }
}

async function testTyping(text) {
  console.log(`\n=== Testing typing: "${text}" ===\n`);
  console.log(`Total characters: ${text.length}`);
  console.log(`Waiting 150ms before starting...\n`);

  await sleep(150);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    console.log(`[${i + 1}/${text.length}]`, char);
    typeCharacter(char);

    // Small delay between characters
    await sleep(50);
  }

  console.log('\n=== Typing test completed ===\n');
}

// Run tests
(async () => {
  console.log('\n╔═══════════════════════════════════╗');
  console.log('║   CopyPaste Typing Test Script   ║');
  console.log('╚═══════════════════════════════════╝\n');

  console.log('Testing robotjs installation...');
  console.log('robotjs version:', robot);

  await sleep(2000);
  console.log('\nStarting typing test in 3 seconds...');
  console.log('Please click on a text editor!');

  await sleep(3000);

  // Test 1: Simple text
  await testTyping('test');
  await sleep(1000);

  // Test 2: Capitals and special chars
  await testTyping('Try typing "Test123"');
  await sleep(1000);

  console.log('All tests completed!');
  process.exit(0);
})();
