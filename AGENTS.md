<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## EmissiSense architecture
- All data access goes through `src/services/api.ts` (mock now, FastAPI later via `APP_CONFIG.backendConnected`) — UI never holds ML logic.
- Emission factors, prices and model metrics live in `src/lib/config.ts`; metrics stay `null` until real results exist — never fabricate results.
