import { useEffect, useMemo, useState } from "react";
import { TOKEN_LIST_URL } from "@jup-ag/core";
import { PublicKey } from "@solana/web3.js";
import SwapTokenInfo from "./SwapTokenInfo";

export const Chart = () => {
  const [tokens, setTokens] = useState([]);
  const [formValue] = useState({
    inputMint: new PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"), // btc
    outputMint: new PublicKey("So11111111111111111111111111111111111111112"), // sol
  });

  console.log(tokens);

  useEffect(() => {
    // Fetch token list from Jupiter API
    fetch(TOKEN_LIST_URL["mainnet-beta"])
      .then((response) => response.json())
      .then((result) => setTokens(result));
  }, []);

  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokens.find(
        (item) => item?.address === formValue.inputMint?.toBase58() || ""
      ),
      tokens.find(
        (item) => item?.address === formValue.outputMint?.toBase58() || ""
      ),
    ];
  }, [formValue.inputMint, formValue.outputMint, tokens]);

  const inputTokenInfos = inputTokenInfo ? inputTokenInfo : null;
  const outputTokenInfos = outputTokenInfo ? outputTokenInfo : null;

  return (
    <div>
      {inputTokenInfo && outputTokenInfo && (
        <SwapTokenInfo
          inputTokenId={inputTokenInfos?.extensions?.coingeckoId}
          outputTokenId={outputTokenInfos?.extensions?.coingeckoId}
        />
      )}
    </div>
  );
};
