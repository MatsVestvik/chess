export default function Home() {
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 8 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 60px)" }}>
      {rows.map((_, rowIndex) =>
        cols.map((_, colIndex) => {

          let isDark = ((rowIndex + colIndex)%2 ==1 ? true:false);

          let squareColor = (isDark ? "#769656" : "#eeeed2");

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 60,
                height: 60,
                backgroundColor: squareColor
              }}
            />
          );
        })
      )}
    </div>
  );
}