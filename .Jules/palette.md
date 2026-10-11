## 2025-02-12 - Accessibility issue in + Dungling button
**Learning:** Adding an aria-label to a button to improve its accessibility name can break e2e playwright tests if they rely on the button text for locating the element.
**Action:** When adding aria-labels to elements that have text, always check the e2e test locators and update them to rely on the new aria-label instead of the visible text.
