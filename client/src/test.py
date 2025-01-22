from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QUrl


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Webpage Manipulation with PyQt")

        # Web view setup
        self.webview = QWebEngineView()
        self.webview.load(QUrl("https://www.youtube.com/watch?v=q1gXyyLksA8"))
        self.webview.loadFinished.connect(self.inject_script)

        # Layout setup
        layout = QVBoxLayout()
        layout.addWidget(self.webview)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def inject_script(self):
        # JavaScript to inject
        js_code = """
        (function() {
            const newDiv = document.createElement('div');
            newDiv.style.position = 'fixed';
            newDiv.style.bottom = '20px';
            newDiv.style.right = '20px';
            newDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            newDiv.style.color = 'white';
            newDiv.style.padding = '10px';
            newDiv.style.borderRadius = '8px';
            newDiv.innerText = 'Hello from PyQt!';
            document.body.appendChild(newDiv);
        })();
        """
        self.webview.page().runJavaScript(
            js_code, lambda result: print("Script executed:", result))


app = QApplication([])
window = MainWindow()
window.show()
app.exec_()
