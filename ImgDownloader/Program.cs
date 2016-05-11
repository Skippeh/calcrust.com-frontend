using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Policy;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ImgDownloader
{
    class Program
    {
        static void Main(string[] args)
        {
            var sources = JsonConvert.DeserializeObject<string[]>(File.ReadAllText("sources.json"));

            Console.WriteLine($"Found {sources.Length} image(s)...");

            Directory.CreateDirectory("downloads");

            var tasks = new List<Task>();

            for (int i = 0; i < sources.Length; ++i)
            {
                var rawSource = sources[i];
                var source = rawSource;

                if (source.Contains("/latest/"))
                    source = rawSource.Substring(0, rawSource.LastIndexOf("/latest/") + "/latest/".Length - 1);

                var uri = new Uri(source);
                string fileName = Uri.UnescapeDataString(uri.Segments[5]);
                fileName = fileName.Substring(0, fileName.Length - 1);
                
                var index = i;
                var task = Task.Run(() =>
                {
                    Console.WriteLine("Downloading " + fileName + "...");
                    var webClient = new WebClient();
                    webClient.DownloadFile(uri, "downloads/" + fileName);
                });
                tasks.Add(task);
            }

            while (tasks.Any(task => task.Status == TaskStatus.Running))
                Thread.Sleep(100);

            Console.WriteLine("Downloaded all");
        }
    }
}