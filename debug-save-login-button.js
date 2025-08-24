// Debug script for Save & Login button issue
// Run this in browser console after opening the chatbot

console.log('%c🔧 SAVE & LOGIN BUTTON DIAGNOSTIC SCRIPT', 'color: red; font-weight: bold; font-size: 16px;');
console.log('========================================\n');

function diagnoseSaveLoginButton() {
  // 1. Check if chatbot is open
  console.log('1. 🏠 Checking chatbot visibility...');
  const chatbotContainer = document.querySelector('[class*="fixed"][class*="inset-0"]');
  const chatButton = document.querySelector('button[class*="gradient"][class*="blue"]');
  
  if (chatButton && !chatbotContainer) {
    console.log('❌ Chatbot appears to be closed. Click the chat button first.');
    console.log('💡 Chat button found:', chatButton);
    return false;
  } else if (chatbotContainer) {
    console.log('✅ Chatbot container found and appears to be open');
  } else {
    console.log('❌ Cannot find chatbot elements');
    return false;
  }

  // 2. Check for Save & Login button
  console.log('\n2. 🔍 Looking for Save & Login button...');
  const saveButtons = document.querySelectorAll('button');
  let saveButton = null;
  
  saveButtons.forEach(btn => {
    const text = btn.textContent?.trim();
    if (text === 'Login & Save' || text === 'Save to Account') {
      saveButton = btn;
      console.log('✅ Found Save button:', btn);
      console.log('   Text:', text);
      console.log('   Classes:', btn.className);
      console.log('   Styles:', window.getComputedStyle(btn));
    }
  });

  if (!saveButton) {
    console.log('❌ Save & Login button not found!');
    console.log('📋 Available buttons:');
    saveButtons.forEach((btn, i) => {
      console.log(`   ${i + 1}. "${btn.textContent?.trim()}" - ${btn.className}`);
    });
    return false;
  }

  // 3. Check button's click handler
  console.log('\n3. 🖱️ Testing button click handler...');
  const clickHandler = saveButton.onclick;
  console.log('   onclick handler exists:', !!clickHandler);
  console.log('   addEventListener events:', getEventListeners ? getEventListeners(saveButton) : 'getEventListeners not available');

  // 4. Check for blocking elements
  console.log('\n4. 🚫 Checking for click blocking...');
  const rect = saveButton.getBoundingClientRect();
  const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
  
  if (elementAtPoint === saveButton) {
    console.log('✅ Button is clickable (not blocked by other elements)');
  } else {
    console.log('❌ Button may be blocked by another element:', elementAtPoint);
  }

  // 5. Check CSS pointer events
  console.log('\n5. 👆 Checking CSS pointer events...');
  const computedStyle = window.getComputedStyle(saveButton);
  console.log('   pointer-events:', computedStyle.pointerEvents);
  console.log('   cursor:', computedStyle.cursor);
  console.log('   display:', computedStyle.display);
  console.log('   visibility:', computedStyle.visibility);
  console.log('   z-index:', computedStyle.zIndex);

  // 6. Test manual click
  console.log('\n6. 🧪 Testing manual click simulation...');
  try {
    console.log('📱 Simulating click event...');
    saveButton.click();
    console.log('✅ Click simulation completed without errors');
  } catch (error) {
    console.log('❌ Error during click simulation:', error);
  }

  // 7. Check React component state (if available)
  console.log('\n7. ⚛️ Checking React component state...');
  const reactFiber = saveButton._reactInternalFiber || saveButton.__reactInternalInstance;
  if (reactFiber) {
    console.log('✅ React fiber found:', reactFiber);
    // Try to find component state
    let currentFiber = reactFiber;
    let attempts = 0;
    while (currentFiber && attempts < 10) {
      if (currentFiber.stateNode && currentFiber.stateNode.state) {
        console.log('📊 Component state found:', currentFiber.stateNode.state);
        break;
      }
      currentFiber = currentFiber.return;
      attempts++;
    }
  } else {
    console.log('⚠️ React fiber not found (normal in production builds)');
  }

  // 8. Check for console errors
  console.log('\n8. 🐛 Monitoring for errors...');
  console.log('💡 Now try clicking the Save & Login button manually and watch console output');
  console.log('💡 Look for any error messages or the debug logs we added');

  return true;
}

function checkChatbotState() {
  console.log('\n🔍 CHECKING CHATBOT STATE...');
  
  // Check localStorage for conversation data
  const pendingConv = localStorage.getItem('pendingConversation');
  const currentMessages = localStorage.getItem('currentChatMessages');
  
  console.log('💾 localStorage data:');
  console.log('   pendingConversation:', pendingConv ? 'exists' : 'not found');
  console.log('   currentChatMessages:', currentMessages ? 'exists' : 'not found');
  
  if (pendingConv) {
    try {
      const parsed = JSON.parse(pendingConv);
      console.log('   Pending conversation messages:', parsed.messages?.length || 0);
    } catch (e) {
      console.log('   Error parsing pending conversation:', e);
    }
  }

  // Check authentication status
  const authData = localStorage.getItem('authToken') || localStorage.getItem('user');
  console.log('🔐 Authentication:', authData ? 'logged in' : 'not logged in');
}

function watchForClicks() {
  console.log('\n👀 SETTING UP CLICK MONITORING...');
  
  // Monitor all clicks on the page
  document.addEventListener('click', function(e) {
    const target = e.target;
    const text = target.textContent?.trim();
    
    if (text === 'Login & Save' || text === 'Save to Account') {
      console.log('%c🖱️ SAVE BUTTON CLICKED!', 'color: green; font-weight: bold;');
      console.log('Target:', target);
      console.log('Event:', e);
      console.log('Bubbles:', e.bubbles);
      console.log('Cancelled:', e.defaultPrevented);
    }
  }, true);
  
  console.log('✅ Click monitoring active. Click the Save & Login button now.');
}

// Run diagnostics
console.log('Starting diagnostics...\n');

setTimeout(() => {
  diagnoseSaveLoginButton();
  checkChatbotState();
  watchForClicks();
  
  console.log('\n📋 DIAGNOSTIC SUMMARY:');
  console.log('1. Copy and paste this script into browser console');
  console.log('2. Open the chatbot by clicking the chat button');
  console.log('3. Start a conversation (send a few messages)');
  console.log('4. Try clicking the "Login & Save" button');
  console.log('5. Watch the console for debug output');
  
  console.log('\n🔍 What to look for:');
  console.log('• "🖱️ BUTTON CLICK EVENT TRIGGERED!" - confirms click is detected');
  console.log('• "🚀 SAVE & LOGIN BUTTON CLICKED!" - confirms function is called');
  console.log('• "📱 About to call setShowAuthOptions(true)" - confirms state update');
  console.log('• Any error messages in red');
  
  console.log('\n💡 Common fixes:');
  console.log('• Clear browser cache and reload');
  console.log('• Check for JavaScript errors blocking execution');
  console.log('• Ensure React is properly loaded');
  console.log('• Try in incognito/private mode');
  
}, 1000);

// Export for manual use
window.debugSaveLogin = {
  diagnose: diagnoseSaveLoginButton,
  checkState: checkChatbotState,
  watch: watchForClicks
};
