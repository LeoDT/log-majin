import { ChakraProvider } from '@chakra-ui/react';
import { DevTools } from 'jotai-devtools';

import { MainTab } from './components/MainTab';

function App() {
  return (
    <ChakraProvider>
      <>
        <MainTab />
        <DevTools />
      </>
    </ChakraProvider>
  );
}

export default App;
