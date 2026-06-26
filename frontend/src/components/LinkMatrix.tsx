import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { Button, Card } from "./Layout";

type MatrixData = {
  sites: { id: string; domain: string; title: string }[];
  matrix: {
    from: { id: string; domain: string; title: string };
    to: { site: { id: string; domain: string }; link: { id: string; anchorText: string; linkType: string } | null }[];
  }[];
};

export function LinkMatrix({
  data,
  onDelete,
}: {
  data: MatrixData;
  onDelete: () => void;
}) {
  const { push } = useToast();
  const { sites, matrix } = data;

  if (sites.length === 0) {
    return <p className="text-slate-500">Добавьте сайты в сеть</p>;
  }

  async function removeLink(linkId: string) {
    if (!confirm("Удалить эту ссылку?")) return;
    try {
      await api(`/links/${linkId}`, { method: "DELETE" });
      push("Ссылка удалена", "success");
      onDelete();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка удаления", "error");
    }
  }

  return (
    <Card className="overflow-x-auto">
      <h3 className="font-semibold mb-4">Матрица ссылок</h3>
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left p-2 text-slate-400 border-b border-slate-800">Откуда \ Куда</th>
            {sites.map((s) => (
              <th
                key={s.id}
                className="p-2 text-slate-400 border-b border-slate-800 font-normal text-xs max-w-[80px] truncate"
                title={s.domain}
              >
                {s.domain.split(".")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.from.id}>
              <td className="p-2 border-b border-slate-800/50 text-cyan-400 text-xs">{row.from.domain}</td>
              {row.to.map((cell) => (
                <td key={cell.site.id} className="p-2 border-b border-slate-800/50 text-center align-middle">
                  {row.from.id === cell.site.id ? (
                    <span className="text-slate-600">—</span>
                  ) : cell.link ? (
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded-full bg-emerald-500"
                        title={`${cell.link.anchorText} (${cell.link.linkType})`}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(cell.link!.id)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                      >
                        удалить
                      </button>
                    </div>
                  ) : (
                    <span className="inline-block w-3 h-3 rounded-full bg-slate-700" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-500 mt-3">
        Зелёная точка — есть ссылка. Нажмите «удалить» для удаления связи.
      </p>
    </Card>
  );
}
